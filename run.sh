#!/bin/bash
#
# run locally
#

#nvm use 8
export $(cat .env)
PORT=4000 npm start
