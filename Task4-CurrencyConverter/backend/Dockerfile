# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies to optimize caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Create a minimal JRE runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/currencyconverter-0.0.1-SNAPSHOT.jar app.jar

# Expose standard web service port
EXPOSE 8080

# Execute Spring Boot jar
ENTRYPOINT ["java", "-jar", "app.jar"]
