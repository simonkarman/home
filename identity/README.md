# Identity Service

## Running locally
Running the identity service locally.
```
# Install dependencies
yarn install

# Run
export DOMAIN=localhost:3000 && export JWT_KEY_FILE=<path-to>/privkey.pem
yarn dev
```

Using the identity service locally.
```
# Health
curl http://localhost:3001/health

# Login
curl -X POST -H "Authorization: Basic $(echo -ne "simon:123" | base64)" http://localhost:3001/sessions

# Get Session
curl -H "Cookie: session-token=<fill-in>" http://localhost:3001/sessions
```

## Request External
Using the identity service when running on `identity.karman.dev`.
```
# Health
curl https://identity.karman.dev/api/health

# Login
curl -X POST -H "Authorization: Basic $(echo -ne "simon:123" | base64)" https://identity.karman.dev/api/sessions

# Get Session
curl -H "Cookie: session-token=<fill-in>" https://identity.karman.dev/api/sessions
```

> TODO: create postman collection

## Adding example users
Example admin (simon:123) account.
```json5
{
    "_id": {
        "$oid": "621d5d1267c4ae2108286042"
    },
    "username": "simon",
    "password": "$2b$10$8w6Ppy0HXa4n6Jp0dPiUrO0wv9hZHL5pYKaxWV35tpY6zh7B.uDWq",
    "scopes": ["admin", "user"]
}
```

Example user (lisa:456) account.
```json5
{
    "_id": {
        "$oid": "621d5d1267c4ae2108286043"
    },
    "username": "lisa",
    "password": "$2b$10$JDIQgdDisrSRuDfRgAiFkuvVL24rpXwwyVZENY9Khf.p9dlvkZTp.",
    "scopes": ["user"]
}
```
