#!/bin/bash
set -e

docker build -t website:develop .
docker rm -f website || true
docker run -d --name website --network app-net --restart unless-stopped website:develop