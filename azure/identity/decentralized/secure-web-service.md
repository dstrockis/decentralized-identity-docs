---
uid: b8c39fd6-5021-4593-a11d-7d5867e446e5
---

Securing messages with DIDs
=============================

Because each DID has one or more public keys, you can use DIDs to authenticate and encrypt messages between two parties. In this article, we'll demonstrate the use of DIDs to authenticate and encrypt messages between a client app and a web server using the experimental DID authentication libraries from the decentralized identity foundation (DIF).

## Prerequisites

As prerequisite, the client and server must each have registered DID and have direct access to the their DID's private key.


## Client: generate authentication request

First, specify the server's DID and generate its initial message to the server which will be used to authenticate the server:

```
TODO when Logan/Henry is back in office
```

Next, send the encrypted message to the server:


```
TODO when Logan/Henry is back in office
```

## Server: process authentication request

On the server, listen for the message, and verify the client's signature on incoming messages:

```
TODO when Logan/Henry is back in office
```

Now respond with your own challenge that can be used to authenticate the client:

```
TODO when Logan/Henry is back in office
```   

## Client: generate message

Now on the client, verify the response received from the server:

 ```
TODO when Logan/Henry is back in office
```   

Having authenticated the server, send a message to the server, signing it with your private keys: 

```
TODO when Logan/Henry is back in office
```   

## Server: authenticate client and receive message

Finally, verify the signature of the incoming message on the server, and extract the message sent by the client. 

```
TODO when Logan/Henry is back in office
```   

Congratulations! You've succesfully added DID based authentication and message encryption to communication between your client and your server. You can be confident that your messages have been kept private, and have ensured that the keys used to do so are under the full control of the users interacting with eachother.

That's all the tutorials we have for now. Be sure to check back periodically for new updates, and if you like what you saw, [get involved](xref:2776478e-dc56-4534-ab56-2b8cde8d375b#want-to-get-involved) to help us build more interesting use cases! 