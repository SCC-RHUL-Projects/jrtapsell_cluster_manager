const {MongoClient} = require("mongodb");
const fs = require("fs");
const _ = require("lodash");
const Hapi = require('hapi');
const {promisify} = require("util");
const hbs = require("handlebars");

const HTTP_OK = 200;

function listChunks() {
    return MongoClient.connect("mongodb://mongo_config1,mongo_config2,mongo_config3?replicaSet=mongors1conf")
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
        }))
        .catch(err => {return {"error": err.message}});
}

const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0"
});


server.route({
    method: 'GET',
    path: '/',
    handler: async function (request, h) {
        const passFile = (await promisify(fs.readFile)("./index.hbs")).toString();
        const chunks = await (listChunks().catch(p => {return {"error": p.message}}));
        const totals = _.chain(chunks)
            .groupBy(p => p.name)
            .mapValues(p => p.length)
            .value();
        totals["total"] = Object.values(totals).reduce((p,q) => p+q);
        totals["mongors1"] |= 0;
        totals["mongors1"] |= 0;
        console.log(totals);

        const page = hbs.compile(passFile)({
            totals,
            totalsJSON: JSON.stringify(totals),
            chunks
        });

        return h
            .response(page)
            .type("text/html")
            .code(HTTP_OK)
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

// noinspection JSIgnoredPromiseFromCall
init();