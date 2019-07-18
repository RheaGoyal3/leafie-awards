SHELL= /bin/bash
include .env

COMMIT_SHA=git-$(shell git rev-parse --verify HEAD | cut -c1-7)


.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: context
context:  ## Set the kubectl context to staging cluster and skunkworks namespace
	kubectl config use-context api.staging.corp.mongodb.com
	kubectl config set-context api.staging.corp.mongodb.com --namespace=skunkworks

# .PHONY: login
# login: context  ## Login to the AWS ECR for skunkworks. Login is valid for 12 hours
# 	./scripts/ecr-login.sh

.PHONY: create
create: login context ## Creates your ECR docker repository
	./scripts/ecr-create.sh

.PHONY: build
build: ## Build and tag your docker container
	docker build -t ${APP} .
	docker tag ${APP} ${REGISTRY}:${COMMIT_SHA}

.PHONY: push
push: build ## Push the image to skunkworks ECR
	docker push ${REGISTRY}:${COMMIT_SHA}

.PHONY: dry-run
dry-run: ## Helm install dry run.  Does not deploy your changes.
	helm install --name=${APP} --dry-run mongodb/web-app --version 4.3.4 -f ./environments/staging.yaml --set "image.tag=${COMMIT_SHA},image.repository=${REGISTRY}" --tiller-namespace=skunkworks --debug

.PHONY: install
install: ## Initial deployment via helm
	helm install --name=${APP} mongodb/web-app --version 4.3.4 -f ./environments/staging.yaml --set "image.tag=${COMMIT_SHA},image.repository=${REGISTRY}" --tiller-namespace=skunkworks

.PHONY: upgrade
upgrade: ## Update existing deployment in skunkworks
	helm upgrade ${APP} mongodb/web-app --install --version 4.3.4 -f ./environments/staging.yaml --set "image.tag=${COMMIT_SHA},image.repository=${REGISTRY}"  --tiller-namespace=skunkworks


.PHONY: purge
purge:
	helm delete --purge ${APP}

## Useful playlists

.PHONY: init-all
init-all: ## First build, push, dry-run and install
	$(MAKE) push
	$(MAKE) dry-run
	$(MAKE) install


.PHONY: cd-all
cd-all: ## Continuos Delivery
	$(MAKE) push
	$(MAKE) upgrade

.PHONY: run
run: build ## locally run the docker container
	docker run -p 8080:8080 ${APP}