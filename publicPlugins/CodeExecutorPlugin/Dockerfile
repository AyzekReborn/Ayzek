# For node
FROM mhart/alpine-node:latest

# Common
RUN apk update &&\
    apk add make libffi git bash

# C/C++
RUN apk add gcc g++

# Python 2/3
RUN apk add python2 python3

# Executor
ADD run.js .
CMD node run