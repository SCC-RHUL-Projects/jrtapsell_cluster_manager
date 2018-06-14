const MongoClient = require('mongodb').MongoClient;
const fs = require("fs");
const _ = require("lodash");


MongoClient.connect("mongodb://mongo_config1,mongo_config2,mongo_config3?replicaSet=mongors1conf", function (err, client) {
    if (err) {
        throw err
    }
    client.db("config").collection("chunks").find({}).toArray(function (err, docs) {
        console.log(docs)
    });
    client.destroy()
});
