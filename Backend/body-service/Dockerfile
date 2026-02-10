# Stage 0: Build
FROM php:8.4-cli AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libicu-dev libonig-dev libxml2-dev libpq-dev default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql intl zip opcache

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Set working directory
WORKDIR /var/www/html

# Copy only the body-service folder
COPY . /var/www/html

# Install PHP dependencies
RUN composer install --no-interaction --no-progress --prefer-dist

# Stage 1: Production image
FROM php:8.4-cli

WORKDIR /var/www/html

# Copy built app from builder
COPY --from=builder /var/www/html /var/www/html

# Expose port
EXPOSE 9000

# Dev server entrypoint
CMD ["php", "-S", "0.0.0.0:9000", "-t", "public"]
