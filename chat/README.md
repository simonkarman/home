# Chat

A chat api (`api/`) and chat ui (`ui/`) that allow users within the karman domain to communicate.

> Requires the 'Chats' collection in the mongodb database.

## Running locally
```bash
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
