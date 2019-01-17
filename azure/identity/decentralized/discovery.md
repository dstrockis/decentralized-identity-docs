---
uid: 3bf346d0-264d-4fcc-a912-154366620acf
---

DID Discovery
======================

Updated: November 8, 2018

<br />

You can use the discovery API to fetch the DID document associated with a DID. This step will be necessary any time you wish to interact with a DID, including during authentication. To discover a DID, you can send an HTTP request:

[!code-http[Resolve DID Request](./code/did-resolution.http.txt#L3-L5)]

And the response for a properly registered DID will take the following format:

[!code-http[Resolve DID Response](./code/did-resolution.http.txt#L7-L40)]

This response format is compliant with DID specifications, which helps to ensure that the discovery API can be used by any software packages that implement DID standards. The full format of the DID document is described in the [DID specification](https://w3c-ccg.github.io/did-spec/), but the highlights include:

| Property     | Description |
| ------------ | ----------- |
| `@context` | The schema of the DID document, accoriding to JSON-LD semantics. | 
| `id` | The DID. |
| `publicKey` | The set of public keys asssociated with the DID that can be used for various interactions, such as authentication. |
| `publicKey.id` | The key ID for the specific key, which can be used for key lookup. |
| `publicKey.type` | The key type of public key. |
| `publicKey.publicKeyPem` | The public key, as a string in PEM format. |

> [!NOTE]
> Public keys may be returned in other formats, such as `publicKeyHex` or `publicKeyJwk`. The [CryptoSuite](https://w3c-ccg.github.io/ld-cryptosuite-registry/) `publicKey.type` will dictate which formats are possible.

If you can receive a DID document for your DID, then your DID is properly registered. You can now use the DID, for instance, to [sign-in to applications](xref:4cbe4653-e1b6-4240-a8f2-cacbb30b95d7).