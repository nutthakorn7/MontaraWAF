#!/bin/bash
# CrowdSec Setup Script
# Registers bouncer and configures collections

set -e

echo "🛡️ Setting up CrowdSec..."

# Wait for CrowdSec to be ready
echo "Waiting for CrowdSec..."
until docker-compose exec -T crowdsec cscli version > /dev/null 2>&1; do
    sleep 2
done
echo "✅ CrowdSec is ready"

# Install collections
echo "📦 Installing collections..."
docker-compose exec -T crowdsec cscli collections install crowdsecurity/nginx
docker-compose exec -T crowdsec cscli collections install crowdsecurity/http-cve
docker-compose exec -T crowdsec cscli collections install crowdsecurity/base-http-scenarios

# Install parsers
echo "📝 Installing parsers..."
docker-compose exec -T crowdsec cscli parsers install crowdsecurity/nginx-logs
docker-compose exec -T crowdsec cscli parsers install crowdsecurity/http-logs

# Register bouncer for APISIX
echo "🔐 Registering bouncer..."
BOUNCER_KEY=$(docker-compose exec -T crowdsec cscli bouncers add apisix-bouncer -o raw)
echo "Bouncer key: $BOUNCER_KEY"

# Save bouncer key to .env
echo "CROWDSEC_BOUNCER_KEY=$BOUNCER_KEY" >> .env

echo ""
echo "✅ CrowdSec setup complete!"
echo ""
echo "📊 Dashboard: cscli metrics"
echo "🔍 Alerts: cscli alerts list"
echo "🚫 Decisions: cscli decisions list"
