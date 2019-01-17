This sample includes a client script and a simple web server that exchange a message that is encrypted and authenticated using DIDs and the [`did-auth-jose`](https://github.com/decentralized-identity/did-auth-jose) library.

To run this sample:

- Install Node 8 or later and npm.
- Run `npm install`.
- Generate two RSA private keys in PEM format, and store them as `private.pem` in the `client` and `server` folders respectively:

```bash
openssl genrsa -out client/private.pem 2048
openssl genrsa -out server/private.pem 2048
```

- Convert each private key into a public key in PEM format format using the following command: 

```bash
openssl rsa -in client/private.pem -outform PEM -pubout -out client/public.pem
openssl rsa -in server/private.pem -outform PEM -pubout -out server/public.pem
```

- Convert the public keys from PEM format to JWK format using the `pem-jwk` node package like so:

```bash
node ./node_modules/pem-jwk/bin/pem-jwk.js client/public.pem > client/public.jwk
node ./node_modules/pem-jwk/bin/pem-jwk.js server/public.pem > server/public.jwk
```

- Append the key-value pair `"kid": "testKey"` to each of the JWKs you created above. You can also use a different key ID value if you prefer.
- Register a DID for each public key on our test drivers by issuing a request like the following, using the `kid` value from above as the `id` value.

```HTTP
POST /api/v1.0 HTTP/1.1
Host: beta.register.did.microsoft.com
Content-Type: application/json
Content-Length: 245

{
    "didMethod": "test",
    "hubUri": "https://beta.hub.microsoft.com/",
    "publicKey": {
        "id": "testKey",
        "type": "RsaVerificationKey2018",
        "publicKeyPem": {jwk-formatted-public-key-with-kid-added-goes-here}
    }
}
``` 

- Replace the dids in `client/send_message.js` and `server/app.js` with the DIDs you just registered. Also replace the `clientKeyId` and `serverKeyId` values in each file if you used a different key ID than `testKey`.
- Run `node server/app.js` to start the server.
- Run `node client/send_message.js` to send a request to the server.