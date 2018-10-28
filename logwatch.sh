#!/bin/bash
#
# watch the logs
#
now logs -f simpleshare.io | grep -v status.json | cut --characters=27- | pino-pretty