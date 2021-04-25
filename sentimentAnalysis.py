import json
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
import requests
import math
nodeServerUrl = "http://localhost:3001/data"
nodePostEndpoint ="http://localhost:3001/pythonSentimentAnalysis" 
azureEndpoint = "https://covidonline.cognitiveservices.azure.com/"
key = "68332c92329c4dba8a2c6022cc6de9fb"
data = requests.get(nodeServerUrl);
category = ''
dataJson = data.json()
formattedPosts = [[]]
formattedPostsTextOnly = [[]]
for item in dataJson:
        if item['text'] != "" and len(item) == 4:
            item['text'] = item['text'].replace("\r","")
            item['text'] = item['text'].replace("\n","")
            item['text'] = item['text'].replace("&amp;","")
            formattedPosts[0].append([item['text'],item['isTwitter'],item['timeCreated']])
        if item['text'] != "" and len(item) == 4:
            item['text'] = item['text'].replace("\r","")
            item['text'] = item['text'].replace("\n","")
            item['text'] = item['text'].replace("&amp;","")
            formattedPostsTextOnly[0].append(item['text'])

def authenticate_client():
    ta_credential = AzureKeyCredential(key)
    text_analytics_client = TextAnalyticsClient(endpoint=azureEndpoint, credential=ta_credential)
    return text_analytics_client    


def sentiment_analysis_example(client,list_name):
    global senti_results 
    senti_results = {'Positive':0,'Neutral':0,'Negative':0,'Unknown':0}
    global senti_errors
    senti_errors = []
    documents = [[]]
    categories =[]
    totalPostlength = len(list_name[0])
    print(totalPostlength)
    amountofIterations = math.ceil(totalPostlength/10)
    print(amountofIterations)
    numOfCalls = 0
    while numOfCalls < amountofIterations+1:
            documents[0] = list_name[numOfCalls*0][:10]
            print('Call:')
            print(numOfCalls)
            numOfCalls +=1
            for row in documents:
                response = client.analyze_sentiment(documents = row)
                i = 0
                while i < len(documents[0]):
                    i+=1
                    try:
                        if response[i].sentiment == "positive":
                            senti_results['Positive'] += 1
                            categories.append("positive")
                        elif response[i].sentiment == "neutral":
                            senti_results['Neutral'] += 1
                            categories.append("neutral")
                        elif response[i].sentiment == "negative":
                            senti_results['Negative'] +=1
                            categories.append("negative")
                        else:
                            senti_results['Unknown'] +=1
                            categories.append("unknown")
                    except:
                        senti_errors.append(row)
                        categories.append("error")

    count = 0
    returnSet=[]
    print(senti_results)
    for item in formattedPosts[0]:
            returnSet.append({'text':item[0],'isTwitter':item[1],'timeCreated':item[2],'category':categories[count]})
            count +=1
            
    print(returnSet)
    print(json.dumps(returnSet))
    for item in returnSet:
            sendOff=requests.post(nodePostEndpoint, data=item)
    
    return(senti_results,senti_errors)


#Assigning authentication function to object
print("Hello World")
client = authenticate_client()
sentiment = sentiment_analysis_example(client,formattedPostsTextOnly)
exit()
