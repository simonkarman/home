Generate lets encrypt certificates, using:
`certbot --standalone -d tictactoe.karman.dev --work-dir . --config-dir . --logs-dir ./logs certonly`

Renew:
`certbot renew --config-dir . --work-dir . --logs-dir ./logs`