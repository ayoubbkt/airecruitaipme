# .gitpod.Dockerfile
FROM gitpod/workspace-full

RUN sudo apt-get update && sudo apt-get install -y openjdk-17-jdk
RUN sudo update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java
RUN sudo update-alternatives --set javac /usr/lib/jvm/java-17-openjdk-amd64/bin/javac
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
RUN echo "export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> ~/.bashrc
RUN pyenv install 3.9.0 && pyenv global 3.9.0