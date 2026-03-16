FROM eclipse-temurin:17-jre

ENV TZ=Asia/Seoul

WORKDIR /app
COPY build/libs/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]