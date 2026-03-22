# ========= BUILD STAGE =========
FROM maven:3.9.8-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom first for dependency caching
COPY pom.xml .

# Download dependencies first
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build jar
RUN mvn clean package -DskipTests

# ========= RUNTIME STAGE =========
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]