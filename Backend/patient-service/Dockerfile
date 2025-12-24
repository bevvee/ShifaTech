# Étape 1 : build le JAR
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Étape 2 : image finale
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# On copie le JAR depuis l'étape build
COPY --from=build /app/target/patient-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
