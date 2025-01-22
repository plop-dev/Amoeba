# Amoeba API

## How does it work?
Every request is client-to-server encrypted using a **shared** token. This token is stored on both the client and server, and is used to encrypt and decrypt request bodies. This way, no malicious actors can intercept or tamper with the data being sent.

Then, each sensitive (ie. everything) value is encrypted using a **client-only** token, held only by the client. This way, even if the server is compromised, the data is still safe, and all data is fully end-to-end encrypted.

### Token Types
- **Shared** - used to encrypt and decrypt request bodies
- **Client-Only** - used to encrypt and decrypt sensitive values in json

### Generating Tokens
To log in to the client, a **file** must be inputed. Using two different hash algorithms (TODO: decide on algorithms) we can generate two separate tokens.
