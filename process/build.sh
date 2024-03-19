#!/bin/zsh

docker run --platform linux/amd64 -v $(pwd):/src p3rmaw3b/aosqlite emcc-lua
