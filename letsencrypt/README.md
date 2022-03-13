Generate lets encrypt certificates, using:
`certbot --server https://acme-v02.api.letsencrypt.org/directory -d '*.karman.dev' --manual --preferred-challenges dns-01  --config-dir . --work-dir . --logs-dir ./logs certonly`

Renew:
`certbot renew --config-dir . --work-dir . --logs-dir ./logs`