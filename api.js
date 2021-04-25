var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var cors = require('cors');
var axios = require ('axios');
const port= 3001;
const dbUrl = 'mongodb://localhost:27017';
var  runSentimentAnalysis = require('./src/SentimentAnalysis');


var dbConn = MongoClient.connect(dbUrl, {
    useUnifiedTopology: true
})



dbConn.then(function(client){
    var database = client.db('covidonline');
    var collection = database.collection('posts');
    var tesCollection = database.collection('testPosts');
    var classificationCollection = database.collection('postsClassified');

    var app = express();
    app.use(cors())
    app.listen(port, ()=> console.log(`API running at http:localhost:${port}`))

    app.use(bodyParser.urlencoded({ extended: true}))

    app.get('/storePosts', function (req,res) {
        axios.get("https://www.reddit.com/r/COVID.json")
        .then(function(response){
             var array = response.data.data.children;
            for (i=0;i<array.length; i++){
            if (array[i].data.selftext != ""){
            collection.insertOne({text:array[i].data.selftext,
            timeCreated:array[i].data.created_utc,
            isTwitter:"false"
            });
            }
            }
            })
        .catch( function (error) {console.log(error.message)});
        runSentimentAnalysis();
        res.send('Posts stored and data analysis done');
    })

    app.post('/pythonSentimentAnalysis', function(req,res){
        console.log("req.body");
        database.collection('postsClassified').insertOne({text:req.body.text,
            timeCreated:req.body.timeCreated,
            isTwitter:req.body.isTwitter,
            category:req.body.category
        });
        res.send("Results of Analysis stored")
    })

    app.get('/data/:term', function (req,res){
        console.log(req.params);
        database.collection('postsClassified').find({"text": RegExp(req.params.term, 'i')}
        ).toArray(function (err,data){
            res.send(data)

        })
        
    })
    app.get('/data', function (req,res){
        collection.find({}).toArray(function (err,data){
            res.send(data)

        })
        
    })
})