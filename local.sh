#!/bin/bash
docker run -ti --rm -v $(pwd):/usr/share/nginx/html:ro -p 8080:80 nginx:1.21.4-alpine
