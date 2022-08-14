# Chat

A chat api (`api/`) and chat ui (`ui/`) that allows users within the karman domain to communicate.

> MongoDB: Requires a 'Messages' collection in the 'chat' database.

## Running api locally
```bash
# Start the service (the JWT_KEY_FILE should be the same key that the identity service is using)
export DOMAIN=localhost && export JWT_KEY_FILE=<path-to>/privkey.pem # TODO: ensure that these can work with just the public key
yarn dev

# Health
curl http://localhost:3003/health

# Login at identity (make sure identity is running at port 3001)
curl -X POST -H "Authorization: Basic $(echo -ne "simon:123" | base64)" http://localhost:3001/sessions -v
export SESSION_TOKEN="<paste value here>"

# Get all messages
curl 'http://localhost:3003/messages?pageNumber=0&pageSize=10' -H "Cookie:session-token=$SESSION_TOKEN"

# Send a message
curl -X POST 'http://localhost:3003/messages' -H 'Content-Type: application/json' --data '{"content":"Goed!"}' -H "Cookie:session-token=$SESSION_TOKEN"

# Delete a message (admin scope only)
curl -X DELETE 'http://localhost:3003/messages/<message-id>' -H "Cookie:session-token=$SESSION_TOKEN"
```

## Test api live
```bash
# Health
curl https://chat.karman.dev/api/health -H "Cookie:session-token=$SESSION_TOKEN"

# Login at identity (make sure identity is running at port 3001)
curl -X POST -H "Authorization: Basic $(echo -ne "simon:123" | base64)" https://identity.karman.dev/api/sessions -v
export SESSION_TOKEN="<paste value here>"

# Get all messages
curl https://chat.karman.dev/api/messages?pageNumber=0&pageSize=10 -H "Cookie:session-token=$SESSION_TOKEN"

# Send a message
curl -X POST https://chat.karman.dev/api/messages -H 'Content-Type: application/json' --data '{"content":"Goed!"}' -H "Cookie:session-token=$SESSION_TOKEN"

# Delete a message (admin scope only)
curl -X DELETE https://chat.karman.dev/api/messages/<message-id> -H "Cookie:session-token=$SESSION_TOKEN"
```
