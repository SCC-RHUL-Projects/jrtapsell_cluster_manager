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

touch mongo_shard1_node1.std
touch mongo_shard1_node2.std
touch mongo_shard1_node3.std

touch mongo_shard2_node1.std
touch mongo_shard2_node2.std
touch mongo_shard2_node3.std

touch mongo_config1.std
touch mongo_config2.std
touch mongo_config3.std

touch mongos1.std
touch mongos2.std

chmod 666 ./*

