# Messages

## Types
Types defined and used for messages.
### message
- `id`: string - the message id
- `sent`: date - the date the message was sent
- `expires`: date - the date it expires
- `sender`: string - the user id of the person who sent the message
- `text`: string - contents of the message
- `has_read`: map<user_id: bool> - which users have read the message (true -> read, false -> unread)
- `reply_to`: string? - the id of the message this is a reply to
- `reactions`: map<emoji: count> - how many reactions each emoji has
