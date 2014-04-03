#!/bin/sh

# install 'nvm', a node version manager
curl https://raw.github.com/creationix/nvm/v0.4.0/install.sh | sh

# install test-framework 'mocha' as global dependecy
npm install -g mocha
