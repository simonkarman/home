# Identity Service

```
# Login
curl -X POST -H "Authorization: Basic $(echo -ne "simon:123" | base64)" -v https://tictactoe.karman.dev/sessions

# Get Session
curl -H "Cookie: session-token=<token-here>" -v https://ws.karman.dev/sessions
```

> TODO: create postman collection
