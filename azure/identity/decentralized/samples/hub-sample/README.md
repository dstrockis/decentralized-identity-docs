This sample is a simple CLI that reads & writes to-do list items to a DID's identity hub using the [`did-auth-jose`](https://github.com/decentralized-identity/did-auth-jose) library.

To run this sample:

- Install Node 8 or later and npm.
- Run `npm install`.
- Generate an RSA private keys in PEM format, and store it as `private.pem` in the current folder:

```bash
openssl genrsa -out private.pem 2048
```

- Convert the private key into a public key in PEM format format using the following command: 

```bash
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

- Run the DID registration script in the repo's root to register a DID for your website.

```bash
node register.js
```

- Copy the DID output by this script in the response, and replace the `userDid` value in `index.js` with your new DID value.
- Link the current package to your file system so you can run the commands from the sample CLI:

```bash
npm link
```
- Run CLI commands to read and write data to your DID's identity hub! Currently only adding items and listing items are supported:

```bash
todo help
todo add --text 'go to the grocery store'
todo list
```