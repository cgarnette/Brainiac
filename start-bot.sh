docker rm -f braniac
docker run -d --name braniac -p '3005:3005' braniac:1.0.4