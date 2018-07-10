#!/bin/bash

pushd .

cd mongo-sharded

docker-compose stop
docker-compose rm -fv

./cleanLogs.sh

docker-compose up --no-start
docker-compose start
cd ../
cd manager
node ./index.js
cd ../
echo "Waiting 10 seconds to wait for balance"
sleep 10
# ./status.sh &&
echo "Press any key to exit"

read -n 1

popd
docker-compose -f mongo-sharded/docker-compose.yml stop
docker-compose -f mongo-sharded/docker-compose.yml rm -fv
echo "Exiting"
