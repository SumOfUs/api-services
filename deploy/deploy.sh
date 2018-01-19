#!/usr/bin/env bash
ENV=$1
$(npm bin)/serverless deploy -s $ENV --conceal
