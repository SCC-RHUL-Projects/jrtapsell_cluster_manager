#!/bin/bash

# https://askubuntu.com/questions/15853/how-can-a-script-check-if-its-being-run-as-root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

docker-compose -f mongo-sharded/replica.yml stop
docker-compose -f mongo-sharded/replica.yml rm -f
rm -rf mongo-sharded/data

docker-compose -f mongo-sharded/replica.yml up --no-start
docker-compose -f mongo-sharded/replica.yml start

cd manager
node ./index.js &&
echo "Press any key to exit" &&
read -n 1

cd ../
docker-compose -f mongo-sharded/replica.yml stop
docker-compose -f mongo-sharded/replica.yml rm -f
echo "Exiting"
