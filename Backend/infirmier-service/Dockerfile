FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev \
    && docker-php-ext-install pdo pdo_mysql intl zip

WORKDIR /var/www/html

COPY . .

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer install --no-interaction --no-progress

EXPOSE 9000

CMD ["php", "-S", "0.0.0.0:9000", "-t", "public"]
