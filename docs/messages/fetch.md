# Fetching
`GET /messages/get`

This request uses ✨ pagination ✨, so we don't have to return all messages at once. If a cursor is returned on your first request, that can be used to retrieve the next 100 messages.

### Params
- `project`: string - the id of the project the channel is in
- `channel`: string - the channel id
- `cursor`: string? - cursor for getting previous messages

### Returns (200)
- `ok`: bool - always true
- `messages`: messages[] - the messages (max 100)
- `cursor`: string? - cursor for retrieving more messages

### Returns (404 or 400)
- `ok`: bool - always false
- `error`: string - the error message

### Errors
- `project_not_found`: the project does not exist
- `channel_not_found`: the channel does not exist
- `cursor_not_found`: the cursor is invalid
- `unauthorized`: invalid authentication token
