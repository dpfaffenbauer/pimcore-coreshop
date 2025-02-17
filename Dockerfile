FROM ghcr.io/cors-gmbh/pimcore-docker/php-fpm:8.4-alpine3.21-7.1.0 AS dev
RUN set -eux; \
    apk update; \
    apk add $PHPIZE_DEPS libxslt-dev; \
    docker-php-ext-install xsl; \
    docker-php-ext-install sockets; \
    sync; \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* /usr/share/doc/*

RUN echo 'xdebug.idekey = PHPSTORM' >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo 'xdebug.mode = debug' >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

FROM dev AS behat
RUN apk update && \
    apk add -y chromium chromium-driver

# Install Symfony, Pimcore and CoreShop inside Tests container
# RUN wget https://get.symfony.com/cli/installer -O - | bash
RUN curl --proto "=https" --tlsv1.2 -sSf -L https://might-redirect.example.com/install.sh | sh
RUN apt install symfony-cli

ENV PANTHER_NO_SANDBOX=1
ENV PANTHER_CHROME_ARGUMENTS='--disable-dev-shm-usage'
ENV CORESHOP_SKIP_DB_SETUP=1
ENV PANTHER_NO_HEADLESS=0
ENV APP_ENV="test"

