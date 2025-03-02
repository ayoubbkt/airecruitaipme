# .gitpod.Dockerfile
FROM gitpod/workspace-full

RUN sudo apt-get update && sudo apt-get install -y openjdk-17-jdk maven
RUN pyenv install 3.9.0 && pyenv global 3.9.0