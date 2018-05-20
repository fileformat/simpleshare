#!/bin/bash

LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)
grep -q "^LASTMOD=" .env
if [ $? -ne 0 ]; then
    echo "Appending"
	echo "LASTMOD=$LASTMOD" >> .env
else
    echo "Updating"
	sed -i -e "s/^LASTMOD=.*$/LASTMOD=$LASTMOD/g" .env
fi

COMMIT=$(git rev-parse HEAD | cut -c 1-7)
grep -q "^COMMIT=" .env
if [ $? -ne 0 ]; then
    echo "Appending"
	echo "COMMIT=$COMMIT" >> .env
else
    echo "Updating"
	sed -i -e "s/^COMMIT=.*$/COMMIT=$COMMIT/g" .env
fi

now list simpleshare.io

# need to remove old one
#now rm <URL>

now --public --dotenv  && now alias

