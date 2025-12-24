FROM php:8.2-fpm

# Installer extensions PHP
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libxml2-dev \
    && docker-php-ext-install intl pdo pdo_mysql

# Installer Composer depuis l'image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install
