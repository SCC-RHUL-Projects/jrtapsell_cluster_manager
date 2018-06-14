#!/bin/bash
docker exec -it mongos1 bash -c "printf 'db.printShardingStatus(verbose=true)' | mongo "
