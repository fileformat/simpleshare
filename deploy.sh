#!/bin/bash

LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)
grep -q "^LASTMOD=" .env
if [ $? -ne 0 ]; then
	echo "LASTMOD=$LASTMOD" >> .env
else
	sed -i -e "s/^LASTMOD=.*$/LASTMOD=$LASTMOD/g" .env
fi

COMMIT=$(git rev-parse --short HEAD)
grep -q "^COMMIT=" .env
if [ $? -ne 0 ]; then
	echo "COMMIT=$COMMIT" >> .env
else
	sed -i -e "s/^COMMIT=.*$/COMMIT=$COMMIT/g" .env
fi

TOKEN=$(cat ~/.now/auth.json | jq ".credentials[0].token" --raw-output)
NAME=$(cat ./now.json | jq '.name' --raw-output)
OLD_DEPLOY=$(curl "https://api.zeit.co/v2/now/deployments" --silent --show-error --header "Authorization: Bearer $TOKEN" | jq ".deployments[] | select(.name | contains(\"$NAME\")) | .url" --raw-output)

now --public --dotenv && now alias && now rm $OLD_DEPLOY
