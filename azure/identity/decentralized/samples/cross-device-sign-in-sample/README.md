This sample is a simple website that signs in a user using DIDs and the [`did-auth-jose`](https://github.com/decentralized-identity/did-auth-jose) library.

To run this sample:

- Install Node 8 or later and npm.
- Run `npm install`.
- Generate an RSA private keys in PEM format, and store it as `private.pem` in the `server` folder:

```bash
openssl genrsa -out server/private.pem 2048
```

- Convert the private key into a public key in PEM format format using the following command: 

```bash
openssl rsa -in server/private.pem -outform PEM -pubout -out server/public.pem
```

- Run the DID registration script in the repo's root to register a DID for your website.

```bash
node register.js
```

- Copy the DID output by this script in the response, and replace the `serverDid` value in `server/app.js` with your new DID value.
- Run `node server/app.js` to start the server.
- Navigate to `localhost:8080` to load the website.
- Make sure you have installed the latest user agent chrome extension, and have registered a DID via the user agent.
- Sign in with your DID!