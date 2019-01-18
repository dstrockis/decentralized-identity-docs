---
uid: 4cbe4653-e1b6-4240-a8f2-cacbb30b95d7
---

DID sign-in for web applications
=======================

You can allow users to sign-in to your app with their DID instead of a username & password or a social account like Google or Facebook. In this article, you'll build a simple web app that authenticates a user with their DID using experimental DID authentication libraries from the Decentralized Identity Foundation (DIF).

## Prerequisites

Before getting started, you should:

- [Install the test user agent](xref:a6b91f7e-4dac-4d20-9b1e-52d423e86feb) as a chrome extension.
- [Register a DID for your user](xref:4d54b401-1bb0-4470-9d43-c2cb2cde1184) in the user agent.
- [Install NodeJS 8 or later](https://nodejs.org), which will be used to run our web app.
- [Install OpenSSL](https://www.openssl.org) or use bash to generate key pairs for the web server.

## Download code sample

To download the code, [click here](./dist/sign-in-sample.zip) to download a zip file and unzip it to a location of your choice.

## Set up the web server 

First, run `npm install` in the directory where you unzipped the sample code. This will install all required dependencies for our web app.

```bash
npm install
```

Next, generate an RSA private key and public key pair in PEM format, and store them as `private.pem` and `public.pem` in the `server` folder. This private key, and its corresponding public key, will be used to register a DID that will represent the web app. All sign-in requests issued by the website must be signed using this private key. This allows user agents and users to reliably identify the origin of sign-in requests, helping keep things secure.

```bash
openssl genrsa -out server/private.pem 2048
openssl rsa -in server/private.pem -outform PEM -pubout -out server/public.pem
```

Now, run the DID registration script in the repo's root to register a DID for your website. This script will use the keys you generated above to register a DID for the website. For details on how this script works, read [the registration tutorial](xref:4d54b401-1bb0-4470-9d43-c2cb2cde1184).

```bash
node register.js
```

Lastly, copy the DID output by this script and replace the `serverDid` value in `server/app.js` with your website's new DID.

> [!NOTE]
> For now, we will use RSA as our default crypto algorithm. We plan on supporting other algorithms such as Secp256k1 and Ed25519 in the future.

## Run the web app

Now you're ready to run the sample web app:

- Run `node server/app.js` to start the server.
- Navigate to `localhost:8080` to load the website.
- Sign in with your DID!

When you trigger a sign-in request, open the chrome extension to approve the sign in request. After approving, you should be signed into the app with your DID!

## Code walk through

The remainder of this article will walk through the important parts of the sample code, explaining how DIDs are used for web authentication.  

### server/index.html

The sample code starts with a very simple web page with a sign-in button:

[!code-html[Sign-in button](./code/did-web-auth.html#buttononly)]

When the button is clicked, the web page does three things:

1. It sends a request to the server to get a signed authentication request.
2. It then asks the user to sign in by sending the signed authentication request to the user agent via the `navigator.did.requestAuthentication` API that the chrome extension injects into the page.
3. It waits for a response from the user agent, and updates the web page UI with the result.

[!code-html[Sign-in button](./code/did-web-auth.html#sendrequest)]

This is all that is necessary to add DID based sign-in to your web page. The entire `index.html` file is available in the [complete sample](./dist/sign-in-sample.zip). Now let's move on to the server.

### server/app.js

The server implementation begins by loading the DIF authentication packages, reading the website's private key from disk, and instantiating an `Authentication` class. Most of the code here is used to convert keys into the expected formats.

[!code-javascript[Generate auth request](./samples/web-sign-in-sample/server/app.js#L10-L43)]

The first route the server exposes is the `/login` route, which receives AJAX requests from the browser and returns a signed DID authentication request using the `Authentication` class. The browser will ask for a new signed request each time the user clicks the sign-in button.

[!code-javascript[Generate auth request](./samples/web-sign-in-sample/server/app.js#L81-L102)]

| property | value | description | 
| -------- | ----- | ----------- |
| `iss` | `did:test:79cc8f04-0588-4513-b1c6-ae987610c082` | The DID of the website issuing the sign-in request |
| `response_type` | `id_token` | Must be `id_token` |
| `client_id` | `https://localhost:8080/auth-response` | In accordance with OpenID Connect self-issued, the redirect URI should be used as the client ID value. This is the location where the authentication response will be returned. | 
| `scope` | `openid` | Must be `openid` |
| `state` | `12345` | Can be used to pass context from the authentication request to the authentication response. The exact value used here will be included in the resulting authentication response. |
| `nonce` | `12345` | A randomized string that is used to prevent token replay attacks. Its value must be checked during response validation. In the sample, we've used the `express-session` session ID as a nonce. |
| `claims` | `undefined` | For future use only. |

When the user approves a sign-in request, their user agent will return a DID authentication response to the indicated redirect URI. The server will receieve this request at `/auth-response` and validate it using the `Authentication` class:

[!code-javascript[Generate auth request](./samples/web-sign-in-sample/server/app.js#L104-L114)]

The user's DID is available in the `sub` claim of the response, which is formatted as a JSON web token ([JWT](https://en.wikipedia.org/wiki/JSON_Web_Token)). You can use this value as the user's unique ID across your apps & systems if you wish.

At this point, you have succesfully authenticated the user with their DID! But our web app is not yet complete. We now want to establish a session with the user, so that the user remains signed-in as they navigate through our site.

After validating the authentication response, start a session using the `express-session` NPM package in `server/app.js`:

[!code-javascript[Generate auth request](./samples/web-sign-in-sample/server/app.js#L104-L123)]

Then on each request to the server, check for a valid DID-bound session, which will ensure the user must be logged in with their DID to access the site:

[!code-javascript[Generate auth request](./samples/web-sign-in-sample/server/app.js#L49-L69)]

Congratulations! You've successfully added DID sign-in to a website using public key credentials that are published using distributed ledger technologies. You're well on your way to building a new wave of apps and services that let users own and control their digital identity.

For the complete code sample, [click here](./dist/sign-in-sample.zip).