#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

docker build -t simpleshare:latest .

docker run \
    --env PORT=4000 \
    -it \
    --publish 4000:4000 \
    simpleshare:latest
