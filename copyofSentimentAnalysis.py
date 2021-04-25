import json
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
import requests
nodeServerUrl = "http://localhost:3001/data"
nodePostEndpoint ="http://localhost:3001/pythonSentimentAnalysis" 
azureEndpoint = "https://covidonline.cognitiveservices.azure.com/"
key = "71848ced88b040f79aac131083f84d05"
data = requests.get(nodeServerUrl);
dataJson = data.json()
formattedPosts = [[]]
for item in dataJson:
        if item['text'] != "":
            formattedPosts[0].append(item['text'])

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
    documents[0] = list_name[0][:10]
    for row in documents:
        response = client.analyze_sentiment(documents = row)
        i = 0
        while i < len(documents[0]):
            i+=1
            try:
                if response[i].sentiment == "positive":
                    senti_results['Positive'] += 1
                elif response[i].sentiment == "neutral":
                    senti_results['Neutral'] += 1
                elif response[i].sentiment == "negative":
                    senti_results['Negative'] +=1
                else:
                    senti_results['Unknown'] +=1
            except:
                senti_errors.append(row)

    print(response)
    sendOff=requests.post(nodePostEndpoint, data=senti_results)
    print(sendOff.status_code, sendOff.reason)
    return(senti_results,senti_errors)


#Assigning authentication function to object
client = authenticate_client()
sentiment = sentiment_analysis_example(client,formattedPosts)

print(sentiment)
