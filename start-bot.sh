docker rm -f brainiac
docker run -d --name brainiac -p '3005:3005' brainiac:1.0.6