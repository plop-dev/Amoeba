## Sending
`POST /messages/send`

### Params
- `project`: string - the id of the project the channel is in
- `channel`: string - the channel id
- `text`: string - the message contents
- `reply_to`: string? - the id of the message this is a reply to

### Returns (200)
- `ok`: bool - always true
- `message`: message - the message that was sent

### Returns (404 or 400)
- `ok`: bool - always false
- `error`: string - the error message

### Errors
- `project_not_found`: the project does not exist
- `channel_not_found`: the channel does not exist
- `unauthorized`: invalid authentication token
- `invalid_text`: the text is empty
- `invalid_reply_to`: the message to reply to does not exist
