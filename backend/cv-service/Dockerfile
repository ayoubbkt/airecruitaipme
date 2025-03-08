FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/cv-service-1.0.0.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
