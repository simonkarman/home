Generate lets encrypt certificates, using:
`certbot --standalone -d home.karman.dev --work-dir . --config-dir . --logs-dir ./logs certonly`

Renew:
`certbot renew --config-dir . --work-dir . --logs-dir ./logs`