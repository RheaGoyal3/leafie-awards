#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
. $parent_path/secrets.sh

$(aws ecr get-login --no-include-email)

