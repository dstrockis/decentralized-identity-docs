---
uid: 2776478e-dc56-4534-ab56-2b8cde8d375b
---

# A new approach to digital **IDENTITY**.

Each of us needs a digital identity we own, one which securely and privately stores all elements of our digital identity. A self-owned identity must seamlessly integrate into our lives and give us complete control over how our identity data is accessed and used.

To learn more, [**READ OUR PAPER**](https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE2DjfY), see our [**DEVELOPER DOCS**](/docs/overview.html) and reach out with questions.

## With a set of simple APIs:

[Create an identity](xref:4d54b401-1bb0-4470-9d43-c2cb2cde1184) for a user, application, organization, or anything else:

```
POST /api/v1.1 HTTP/1.1
Host: beta.register.did.microsoft.com
Content-Type: application/jwt
Content-Length: 461

eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleS0xIn0.ewoJCSJkaWRNZXRob2QiOiAidGVzdCIsCg
kJInB1YmxpY0tleSI6IFt7Imt0eSI6IlJTQSIsImtpZCI6ImtleS0xIiwiZSI6IkFRQUIiLCJu
IjoiMFFHZVJ3ZE9Odl9KRXRFdU4zMFU0YnI1bEY5TlRXNjJmVS1LNnFOVFd5akhGcTNpcDFqSF
9QSjdReGtHdVc4QTdFb1VUSmplWUE3NUw5VDZZaHRaM3ciLCJkZWZhdWx0RW5jcnlwdGlvbkFs
Z29yaXRobSI6IlJTQS1PQUVQIn1dLAoJCSJodWJVcmkiOiAiZXhhbXBsZS5jb20iCgl9.FbS2S
ikxykL77Rf9q73aMeQ307uPXNHojBpKsFgUAiYrqWyasdswSERFeENhNY7v5LFsqA_S99avQUlDSD3UFA
```

[Sign in users](xref:4cbe4653-e1b6-4240-a8f2-cacbb30b95d7) with their identity:
```javascript
// Prompt the user to sign-in
navigator.did.requestAuthentication(authRequest).then(response => {
    
    // If the call succeeded, verify the user was successfully signed in
    checkSignInStatus();

}).catch(error => {
    message = 'Error returned from user agent: ' + error;
});
```

## And more on the way

See our [**DEVELOPER DOCS**](/docs/overview.html) to learn more and see what's coming next.

## Want to get involved?

<table class="table table-landing table-next-steps">
<tbody>
<tr>
<th>Source Code</th>
<th>Developers</th>
<th>Community</th>
<th>Questions</th>
</tr>
<tr>
<td><a href="https://github.com/decentralized-identity"><strong>GITHUB</strong></a></td>
<td><a href="/docs/overview.html"><strong>DOCS</strong></a></td>
<td><a href="https://identity.foundation/"><strong>DIF</strong></a></td>
<td><a href="mailto:ownyouridentity@microsoft.com"><strong>CONTACT US</strong></a></td>
</tr>
</tbody>
</table>