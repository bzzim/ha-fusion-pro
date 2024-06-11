#!/bin/bash

remote="ssh bzz@192.168.100.150 -i ~/Documents/keys/private.pem"
path="$(dirname "$(readlink -f "$0")")"

$remote "docker exec -i homeassistant bash -c 'python3'" < "$path/fetch.py" | \
python3 "$path/split.py" "$path/../../static/translations/"
