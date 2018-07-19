const {MongoClient} = require("mongodb");

async function main() {
    const client = await MongoClient.connect("mongodb://localhost:27017,localhost:27018",{ useNewUrlParser: true });
    const collection = client
        .db("testDb")
        .collection("testCollection");
    const ins = await collection.insert({
        "Hello": "World"
    });
    await client.close();
}

main();