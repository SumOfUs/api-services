#!/usr/bin/env bash
ENV=$1
./deploy/downloadSecrets.js "/$ENV/api-services/" > secrets.sh
source secrets.sh
$(npm bin)/serverless deploy -s $ENV --conceal
