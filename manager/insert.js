const m = require('mongodb').MongoClient;
const fs = require("fs");
const _ = require("lodash");

const data = fs.readFileSync("./lorum.txt");
function insertToDatabase(connectionString, insertCount) {
    return new Promise((resolve) => {
        m.connect(connectionString, function (err, client) {
            if (err) {
                throw Error(err.message)
            }
            const collection = client.db("testDb").collection("testCollection");

            const op = collection.initializeUnorderedBulkOp();

            _.range(insertCount).forEach((i) => {
                op.insert({
                    number: i,
                    payload: data
                })
            });

            op.execute((err) => {
                if (err) {
                    console.log("Insertion failed", err.message);
                }
                client.close();
                resolve()
            })
        });
    });
}

function allTest(connectionString) {
    return new Promise((resolve) => {
        m.connect(connectionString, function (err, client) {
            const collection = client.db("testDb")
                .collection("testCollection");

            const data = collection.insertOne({
                number: -1,
                payload: "Test data"
            });

            console.log(data);
            resolve()

        })
    })
}

module.exports = {
    insertToDatabase,
    allTest
};