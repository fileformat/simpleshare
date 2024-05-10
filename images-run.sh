#!/usr/bin/env bash
#
# run Jekyll locally
#

set -o errexit
set -o pipefail
set -o nounset

jekyll serve --watch --source docs --port 4000
