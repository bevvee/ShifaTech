# Stage 0: Build
FROM php:8.4-cli AS builder

RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libicu-dev libonig-dev libxml2-dev libpq-dev default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql intl zip opcache

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

COPY . /var/www/html

RUN composer install --no-interaction --no-progress --prefer-dist


# Stage 1: Production image
FROM php:8.4-cli

# Install SAME extensions again (IMPORTANT)
RUN apt-get update && apt-get install -y \
    libzip-dev libicu-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql intl zip opcache

WORKDIR /var/www/html

COPY --from=builder /var/www/html /var/www/html

EXPOSE 9000

CMD ["php", "-S", "0.0.0.0:9000", "-t", "public"]
