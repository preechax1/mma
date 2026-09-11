FROM php:8.0-apache

# ติดตั้งส่วนเสริมสำหรับ MySQL
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Allow multipart uploads larger than the default PHP request limit.
COPY php.ini /usr/local/etc/php/conf.d/mma-upload.ini

# ต้องเปิดทั้ง rewrite และ headers (เพิ่ม headers เข้าไป)
RUN a2enmod rewrite headers

# ตั้งค่า Permission ให้ Apache อ่าน .htaccess ได้
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www/html