# =========================================================================
# Build Stage
# =========================================================================
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy only pom.xml first to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy sources and package the application
COPY src ./src
RUN mvn clean package -DskipTests -B

# =========================================================================
# Run Stage
# =========================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built jar from the builder stage
COPY --from=builder /build/target/atm-backend-0.0.1-SNAPSHOT.jar app.jar

# Application port (standard Spring Boot port)
EXPOSE 8080

# Environment variables with defaults
ENV PORT=8080
ENV CORS_ALLOWED_ORIGINS=http://localhost:5173
ENV FIREBASE_CONFIG_PATH=""

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
