const {MongoClient} = require("mongodb");
const fs = require("fs");
const _ = require("lodash");
const Hapi = require('hapi');

const HTTP_OK = 200;

function listChunks() {
    return MongoClient.connect("mongodb://mongos1,mongos2")
        .then(p => p
            .db("config")
            .collection("chunks")
            .find({})
            .toArray())
        .then(p => p
            .filter(p => p.ns === "testDb.testCollection" && p._id.startsWith("testDb.testCollection-_id_ObjectId"))
            .map(p => {
                const minId = p.min._id;
                const maxId = p.max._id;
                return {
                "id": p._id,
                "min": (minId.toHexString ? minId.toHexString() : null),
                "max": (maxId.toHexString ? maxId.toHexString() : null),
                "name":p.shard
            }
        }));
}

const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0"
});

const init = async () => {

    const index = fs.readFileSync("./index.html").toString();
    server.route({
        method: 'GET',
        path: '/api',
        handler: async function (request, h) {
            const chunks = await (listChunks().catch(p => {return {"error": p.message}}));
            const totals = _.chain(chunks)
                .groupBy(p => p.name)
                .mapValues(p => p.length)
                .value();
            totals["mongors1"] |= 0;
            totals["mongors2"] |= 0;

            return h
                .response(JSON.stringify({
                    "all": chunks,
                    "totals": totals
                }))
                .type("application/json")
                .code(HTTP_OK)
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: async function(request, h) {
            return h
                .response(index)
                .type("text/html")
                .code(HTTP_OK);
        }
    });
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

// noinspection JSIgnoredPromiseFromCall
init();