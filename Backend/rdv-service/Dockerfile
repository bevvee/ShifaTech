# Stage 1: build (install composer deps)
FROM php:8.2-fpm AS builder

# Install system packages
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    && docker-php-ext-install pdo pdo_mysql intl zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Set working dir
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP deps
RUN composer install --no-interaction --no-scripts --no-progress

# Copy app source
COPY . .

# Run Symfony scripts (if needed)
RUN composer dump-autoload

# Stage 2: final image (lighter)
FROM php:8.2-fpm

# Install PHP extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    && docker-php-ext-install pdo pdo_mysql intl zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy app from builder
COPY --from=builder /var/www/html /var/www/html

# Expose port (php-fpm)
EXPOSE 9000

