const containers = require("./containers.json");
const events = require("./events.json");
const _ = require("lodash");
const fs = require("fs");

const data = _.chain(containers)
    .map(p => {
        const q = fs.readFileSync(`mongo-sharded/logs/${p}`).toString();
        return [p, _.chain(q.split("\n"))
            .filter(p => p !== "")
            .map(p => JSON.parse(p))
            .map(p => {
                if (p.event === "logCommandAuthzCheck") {
                    return "C_" + p.payload;
                } else {
                    return p.event;
                }
            })
            .uniqBy()
            .value()]
    })
    .value();

const allEvents = _.chain(data)
    .flatMap(p => p[1])
    .uniqBy()
    .value();

const servers = _.chain(data)
    .groupBy(p => p[0])
    .mapValues(p => p[0][1])
    .mapValues((v) => v.map(p => allEvents.indexOf(p)))
    .value();

const header = "," + allEvents.join(",");

const body = _.map(servers, (k, v) => v + "," + _.chain(_.range(allEvents.length).map(q => k.indexOf(q) !== -1)).value()).join("\n")
//console.log(header);

fs.writeFileSync("results.csv", header + "\n" + body);