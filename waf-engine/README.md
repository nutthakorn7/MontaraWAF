# Montara WAF Engine

Web Application Firewall engine with defense-in-depth architecture.

## Stack

| Component | Purpose |
|-----------|---------|
| **CrowdSec** | DDoS L7, Bot Protection, Threat Intel |
| **APISIX** | API Gateway, Rate Limiting, Auth |
| **Coraza** | WAF Rules (OWASP CRS) |
| **PostgreSQL** | Data storage |
| **Redis** | Caching, Rate limiting |
| **Prometheus** | Metrics |
| **Loki** | Logs |

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings
vim .env

# Start the stack
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Endpoints

| Service | URL |
|---------|-----|
| APISIX Gateway | http://localhost:9080 |
| APISIX Admin | http://localhost:9180 |
| CrowdSec API | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Loki | http://localhost:3100 |
| Dashboard | http://localhost:3000 |

## Configuration

```
configs/
├── crowdsec/
│   └── acquis.yaml      # Log sources
├── apisix/
│   ├── config.yaml      # Main config
│   └── apisix.yaml      # Routes & upstreams
├── coraza/
│   └── rules.conf       # WAF rules
└── prometheus/
    └── prometheus.yml   # Scrape config
```

## Architecture

```
Internet → Cloudflare (Optional) → CrowdSec → APISIX + Coraza → App
                                        ↓
                                 Prometheus + Loki
                                        ↓
                                 Montara Dashboard
```

## License

Apache 2.0
