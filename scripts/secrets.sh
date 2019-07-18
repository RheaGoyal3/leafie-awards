#!/bin/bash
# module for getting secrets from k8s

kubectl config set-context api.staging.corp.mongodb.com --namespace=skunkworks

AWS_ACCESS_KEY_ID=$(kubectl get secret ecr -o jsonpath="{.data.ecr_access_key}" | base64 -D && echo)
AWS_SECRET_ACCESS_KEY=$(kubectl get secret ecr -o jsonpath="{.data.ecr_secret_key}" | base64 -D && echo)

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
