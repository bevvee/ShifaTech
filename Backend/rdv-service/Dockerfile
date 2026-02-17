# Use PHP 8.4 CLI base image
FROM php:8.4-cli

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git unzip curl libzip-dev libicu-dev libsodium-dev \
    && docker-php-ext-install pdo pdo_mysql intl zip sodium

# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory inside the container
WORKDIR /var/www/html

# Copy the whole project to the working directory
COPY . ./

# Install PHP dependencies
RUN composer install --no-interaction --no-progress --optimize-autoloader

# Expose port
EXPOSE 9000

# Run PHP built-in server
CMD ["php", "-S", "0.0.0.0:9000", "-t", "public"]
