# Ingress
Enables or disables ingress for home.karman.dev.

To ensure ingress can reach the karman home loadbalancer DNS records have to be created and port forwarding rules have to be set. The DNS records for karman.dev are managed at [Neostrada](https://www.neostrada.nl) and the port forwarding rules are managed in a Zyxel Router on the local network.

To communicate with Neostrada and the Zyxel router you should set the following environment variables:
- `NEOSTRADA_API_KEY` The api key of your Neostrada account, which can be found here: [neostrada.nl/mijn-account/account-api](https://www.neostrada.nl/mijn-account/account-api)
- `ZYXEL_CREDENTIALS` The `username:password` for you Zyxel (VMG8825-T50) router.

Enable the ingress using the following command.
```bash
npm run enable
```

Don't forget to disable the ingress when no longer needed.
```
npm run disable
```

> Note these set the environment variable `MODE` to `enable` or `disable`. This determines wether to enable or disable the ingress using the dns records and port forwarding rules.