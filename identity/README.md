# Identity Service

```
# Login
curl -X POST -H "Authorization: Basic $(echo -ne "simon:123" | base64)" https://identity.karman.dev/api/sessions

# Get Session
curl -H "Cookie: session-token=<fill-in>" https://identity.karman.dev/sessions
```

> TODO: create postman collection

## Adding example users
Example admin account.
```json5
{
    "_id": {
        "$oid": "621d5d1267c4ae2108286042"
    },
    "username": "simon",
    "password": "123simon",
    "scopes": ["admin"]
}
```

Example user account.
```json5
{
    "_id": {
        "$oid": "621d5d1267c4ae2108286043"
    },
    "username": "lisa",
    "password": "456lisa",
    "scopes": ["user"]
}
```