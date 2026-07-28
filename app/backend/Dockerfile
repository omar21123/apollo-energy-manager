FROM php:8.2-fpm

# ==========================================
# System dependencies
# ==========================================
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
        bcmath \
        exif \
        pcntl \
        gd \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ==========================================
# Composer
# ==========================================
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ==========================================
# Working directory
# ==========================================
WORKDIR /var/www

# ==========================================
# Install PHP dependencies
# ==========================================
COPY composer.json composer.lock ./

RUN composer install \
    --prefer-dist \
    --no-interaction

# ==========================================
# Copy source code
# ==========================================
COPY . .

# ==========================================
# Permissions
# ==========================================
RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

RUN chown -R www-data:www-data storage bootstrap/cache

RUN chmod -R 775 storage bootstrap/cache

# ==========================================
# Expose PHP-FPM
# ==========================================
EXPOSE 9000

CMD ["php-fpm"]
