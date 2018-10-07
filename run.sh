#!/bin/bash
#
# run locally
#

#nvm use 8
export $(cat .env)
npx tsc && npm start | npx pino-pretty
