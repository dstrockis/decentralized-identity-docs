---
uid: 4d54b401-1bb0-4470-9d43-c2cb2cde1184
---

DID Registration
===================

Registering a Decentralized Identifier (DID) is the process of creating a unique identifier on a distributed ledger and associating it with one or more public keys. You can prove you are the owner/controller of a DID to anyone you choose, as long as you possess the corresponding private key(s). DIDs form the foundation of decentralized identity. The W3C Credentials Community Group's [DID spec](https://w3c-ccg.github.io/did-spec/) explains the DID technical standard in more detail. 

The way you claim a DID and publish your public keys depends on which distributed ledger you use to register your DID. Each ledger has its own rules, formats, and quirks. Thankfully, the developing DID standard defines common ways to deal with DIDs, and our services expose the standard to you in a simple web API. Currently, we're developing support for the following ledgers:

- Bitcoin
- Ethereum, via uPort
- Sovrin

Our intention is to be chain agnostic, enabling users to choose a DID variant that runs on their preferred ledger. We plan to add support for other DID variants/ledgers that are compliant with DID standards and security requirements.

While we continue to work on DID registration for the ledgers above, we've created a service for generating test DIDs. We call this our `test` DID method. It is not connected to any blockchain or ledger. To try out DID registration with our test method, you can use our example user agent chrome extension, or query our APIs directly.

## Registration via our chrome extension

We've built a test user agent that implements our registration APIs; it is appropriate if you want to try out registration without writing any code. Over time we plan to provide production-ready user agent applications across platforms including mobile and desktop. To register a DID via our user agent: 

[!include[DID creation instructions via chrome extensions](./snippets/create-did-chrome.md)]

Congratulations, you have created your first DID! You can now move on to using this DID to perform [authentication](xref:4cbe4653-e1b6-4240-a8f2-cacbb30b95d7).

## Registration via our APIs

If you're a developer who wants to allow users to register DIDs from your app or service, you can implement DID registration by following the steps below.

### Choose a target ledger

First, you need to decide on which ledger, or DID method, you'll register your DID. Each ledger offers different characteristics and qualities that you might want depending on how you plan to use your new DID.

Thankfully for now, you only have one option: to register on our test method. As we bring support for other ledgers online, we plan to publish guidance choosing the appropriate ledger for your use case.

### Generate a key pair

Next, you need to generate an asymmetric key pair using the key types supported by your target ledger. For testing things out you'll use an RSA key, but the test method also supports Secp256k1 and Ed25519 keys. You can generate your keys however you like, but here's an example using [OpenSSL](https://www.openssl.org/).

[!include[RSA key pair generation instructions](./snippets/create-rsa-keys.md)]

### Generate a JWS

To register a DID using these keys, you must sign a DID registration request with your private key. A DID registration request must be formatted as a compact JSON Web Signature ([JWS](https://tools.ietf.org/html/rfc7515)) with the following body:

[!code-http[Create DID Request](./code/did-registration.http.txt#L17-L29)]

| property | value | description |
| -------- | ----- | ----------- |
| `didMethod` | `test` | The DID method used to register the DID. Currently only `test` is supported. |
| `publicKey` | `[]` | An array of public keys in the JSON Web Key ([JWK](https://tools.ietf.org/html/rfc7517)) format. | 
| `hubUri` | `foo.com` | Any string value, reserved for future use. | 

You can generate and sign a JWS using any tool you like. [JWT.io](https://jwt.io/) maintains a nice list of JWT libraries to use. You can also use DIF's experimental Node JS package to generate and sign a JWT. Make sure you have installed all necessary packages from NPM before running the following script:

[!code-javascript[Create DID Request](./code/did-registration-jws.js)]

### Call the registration API

Now that you've generated your new key pair securely on your own machine, you can publish your public key onto the distributed ledger with the following API call to `https://beta.register.did.microsoft.com/api/v1.1`:

[!code-http[Create DID Request](./code/did-registration.http.txt#L3-L14)]

If your request succeeded, you should receive back the following response:

[!code-http[Create DID Response](./code/did-registration.http.txt#L31-L38)]

| property | value | description |
| -------- | ----- | ----------- |
| `did` | `did:test:79cc8f04-0588-4513-b1c6-ae987610c082` | Your new DID. The format of this value will vary for each DID method, so it should generally be treated as an opaque string. |
| `status` | `registered` | The `status` property indicates the status of the creation of your DID. Possible values include `in-progress`, `failed`, and `not-registered`.  | 

On our `test` method DID creation occurs instantaneously. Other ledgers, however, may require significant queueing and processing time for each new DID. Your next step should be to poll for completion of your DID creation before you proceed to use it. You can poll for a DID's registration status with the following request (substituting `did:test:79cc8f04-0588-4513-b1c6-ae987610c082` for your DID):

[!code-http[DID Status Request](./code/did-registration.http.txt#L40-L42)]

And the response will be the same format as above:

[!code-http[DID Status Request](./code/did-registration.http.txt#L44-L51)]

Once you've received a `registered` status from the Registration API, your DID has been successfully created on the distributed ledger used by the DID method you chose.

> [!NOTE]
> Any DIDs you create on our `test` ledger will be deleted periodically.

### Call the discovery API

Congratulations, you've successfully created a DID! The next step is to use the [discovery API](xref:3bf346d0-264d-4fcc-a912-154366620acf) to double check that your DID can be resolved correctly.