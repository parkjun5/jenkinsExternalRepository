
docker build . -t jenkins-external-repo-test

docker rm -f jenkins-external-repo-test


docker run -d --restart unless-stopped \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e TZ=Asia/Seoul \
  --name map-test-server -p 11000:11000 \
  -v /docker_data/jenkins-external-repo-test:/jenkins-external-repo-test \
  jenkins-external-repo-test

