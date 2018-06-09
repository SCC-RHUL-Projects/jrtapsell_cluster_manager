const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const promisify = require("util").promisify;
const _ = require("lodash");
const chalk = require("chalk");

const projectName = "mongosharded";

const l = () => console.log(JSON.stringify(arguments, null, 4));

const commands = [
    {server:"mongocfg1", command: `rs.initiate({_id: "mongors1conf",configsvr: true, members: [{ _id : 0, host : "mongocfg1" },{ _id : 1, host : "mongocfg2" }, { _id : 2, host : "mongocfg3" }]})`},
    {server:"mongors1n1", command: `rs.initiate({_id : "mongors1", members: [{ _id : 0, host : "mongors1n1" },{ _id : 1, host : "mongors1n2" },{ _id : 2, host : "mongors1n3" }]})`},
    {server:"mongos1", command: `sh.addShard("mongors1/mongors1n1")`},
    {server:"mongors1n1", command: `use testDb`},
    {server:"mongos1", command: `sh.enableSharding("testDb")`},
    {server:"mongors1n1", command: `db.createCollection("testDb.testCollection")`},
    {server:"mongos1", command: `sh.shardCollection("testDb.testCollection", {"shardingField" : 1})`}
];

async function runCommand(containerIds, index) {
    process.stdout.write(`Trying command number: ${index+1}/${commands.length} ... `);
    const command = commands[index];

    const execArgs = {Cmd: ["mongo"], AttachStdin: true, AttachStdout: true, AttachStderr: true};
    const startArgs = {hijack: true, stdin: true, stdout:true, stderr:true};

    const containerId = containerIds[command.server];
    if (containerId == null) {
        throw Error(`Unknown container for ${JSON.stringify(command.server)}`)
    }
    const container = docker.getContainer(containerId);
    const exec = await container.exec(execArgs).then((exec) => Promise.all(
        [
            Promise.resolve(exec),
            new Promise(((resolve, reject) => exec.start(startArgs, (_,q) => resolve(q))))
        ]))
        .then((args) => {
            stream = args[1];
            stream.write(command.command);
            stream.write("\n");
            stream.write("exit\n")
            //docker.modem.demuxStream(stream, process.stdout, process.stderr);
            return args[0]
        });
    while (true) {
        await sleep()
        const log = await exec.inspect()
        const exitCode = log.ExitCode;
        if (exitCode == null) {
            continue
        }
        if (exitCode === 0) {
            console.log(chalk.green("Success"));
            if (index + 1 in commands) {
                runCommand(containerIds, index + 1)
            } else {
                terminate(containerIds)
            }
        } else {
            await sleep()
            console.log(chalk.red("Failed"));
            runCommand(containerIds, index)
        }
        break
    }
}

async function terminate(containerIds) {
    docker.getContainer(containerIds["mongoExpress"])
        .restart();
}

function sleep() {
    return new Promise((resolve, reject) =>
        setTimeout(resolve, 1000)
    )
}
async function main() {
    const containerIds = _.chain(await docker.listContainers())
        .filter(p => p.Labels["com.docker.compose.project"] === projectName)
        .groupBy(p => p.Labels["com.docker.compose.service"])
        .mapValues(p => p[0].Id)
        .value();

    runCommand(containerIds, 0)
}

main();