const m = require('mongodb').MongoClient;
const fs = require("fs");
const _ = require("lodash");

function insertToDatabase(connectionString, insertCount) {
    return new Promise((resolve) => {
        m.connect(connectionString, function (err, client) {
            if (err) {
                throw Error(err.message)
            }
            const collection = client.db("testDb").collection("testCollection");

            fs.readFile("./lorum.txt", (data) => {
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
            })
        });
    });
}
module.exports = {
    insertToDatabase
};