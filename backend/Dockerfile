# ── Stage 1: Build ──────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy dependency descriptor first for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Runtime ───────────────────────────────────────────────────
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app

# Create non-root user
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

# Copy built artifact
COPY --from=build /app/target/*.jar app.jar

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
