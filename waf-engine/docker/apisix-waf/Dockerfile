# APISIX with Coraza WAF Plugin
# Custom build for production WAF blocking

FROM apache/apisix:3.8.0-debian

# Install build dependencies
USER root
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    make \
    libpcre3-dev \
    libssl-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Coraza for APISIX (lua-resty-coraza)
RUN luarocks install lua-resty-mlcache && \
    luarocks install lua-resty-template

# Copy Coraza WAF configuration
COPY configs/coraza/ /usr/local/apisix/conf/coraza/
COPY configs/apisix/apisix.yaml /usr/local/apisix/conf/apisix.yaml
COPY configs/apisix/config.yaml /usr/local/apisix/conf/config.yaml

# Set permissions
RUN chown -R apisix:apisix /usr/local/apisix/conf/

USER apisix

EXPOSE 9080 9443 9180 9091
