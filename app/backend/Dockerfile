FROM php:8.2-fpm

# -------------------------------------------------------
# System packages
# -------------------------------------------------------
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------------------------------
# Composer
# -------------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# -------------------------------------------------------
# Copy project
# -------------------------------------------------------
COPY . .

# -------------------------------------------------------
# Laravel directories
# -------------------------------------------------------
RUN mkdir -p \
    bootstrap/cache \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs

RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

RUN chmod -R 775 \
    storage \
    bootstrap/cache

# -------------------------------------------------------
# Composer
# -------------------------------------------------------
RUN composer install \
    --prefer-dist \
    --no-interaction \
    --no-dev

# -------------------------------------------------------
# Optimize
# -------------------------------------------------------
RUN composer dump-autoload --optimize

EXPOSE 9000

CMD ["php-fpm"]
