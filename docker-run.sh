#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

docker build -t simpleshare:latest .
docker run -it -p 4000:4000 simpleshare:latest
