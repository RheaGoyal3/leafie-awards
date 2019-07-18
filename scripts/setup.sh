#!/bin/bash

which brew || (echo "Homebrew required." && exit 1)

# base kanopy dependencies and tools
which kubectl || (brew install kubernetes-cli  && brew switch kubernetes-cli 1.14.1 )
which helm || brew install kubernetes-helm

# install ksec, useful for managing secreets in k8s (kubernetes)
helm ksec > /dev/null || (helm init --client-only && helm plugin install https://github.com/10gen-ops/ksec)

