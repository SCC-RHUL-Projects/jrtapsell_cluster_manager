#!/bin/bash
rm -rf logs
mkdir logs
cd logs
touch mongo_shard1_node1.prov
touch mongo_shard1_node2.prov
touch mongo_shard1_node3.prov

touch mongo_shard2_node1.prov
touch mongo_shard2_node2.prov
touch mongo_shard2_node3.prov

touch mongo_config1.prov
touch mongo_config2.prov
touch mongo_config3.prov

touch mongos1.prov
touch mongos2.prov

touch mongo_shard1_node1.stdout
touch mongo_shard1_node2.stdout
touch mongo_shard1_node3.stdout

touch mongo_shard2_node1.stdout
touch mongo_shard2_node2.stdout
touch mongo_shard2_node3.stdout

touch mongo_config1.stdout
touch mongo_config2.stdout
touch mongo_config3.stdout

touch mongos1.stdout
touch mongos2.stdout

touch mongo_shard1_node1.stderr
touch mongo_shard1_node2.stderr
touch mongo_shard1_node3.stderr

touch mongo_shard2_node1.stderr
touch mongo_shard2_node2.stderr
touch mongo_shard2_node3.stderr

touch mongo_config1.stderr
touch mongo_config2.stderr
touch mongo_config3.stderr

touch mongos1.stderr
touch mongos2.stderr

chmod 666 ./*

