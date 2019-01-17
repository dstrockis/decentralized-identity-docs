////////////// Packages
var http = require('http');
var pemJwk = require('pem-jwk');
var fs = require('fs');
var path = require('path');

var hub = require('@decentralized-identity/hub-node-core');
var didAuth = require('@decentralized-identity/did-auth-jose')
var RsaPrivateKey = require('@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey');

///////////// Constants
const discovery_endpoint = "https://beta.discover.did.microsoft.com/";
const serverKeyId = "testKey";
const serverDid = 'did:test:973b194d-b02e-4d86-ae9e-f44793a0e470';


///////////// Load private key
// Convert PEM RSA key into JWK with correct key ID
const privatePem = fs.readFileSync(path.resolve(__dirname, './private.pem'), 'ascii');
const jwk = pemJwk.pem2jwk(privatePem);
jwk.kid = `${serverDid}#${serverKeyId}`;

// create RsaPrivateKey instance
const key = new RsaPrivateKey.default({
    id: jwk.kid,
    type: 'RsaVerificationKey2018',
    publicKeyJwk: jwk
});

// convert key into dict of keys
const keys = {};
keys[jwk.kid] = key;

//////////// DID auth module setup 
// create Authentication class
const resolver = new hub.HttpResolver(discovery_endpoint);
const auth = new didAuth.Authentication({
    keys,
    resolver
});

//////////// Main server function
http.createServer(function (req, res) {

  console.log('Received a request.');

  req.on('data', async function (chunk) {

    try {

      // parse & decrypt incoming request
      // NOTE: getVerifiedRequest is a bit of a weird name
      verifiedRequest = await auth.getVerifiedRequest(chunk, true);

      // the auth library might return us a token to give to the client
      // if one wasn't provided in the request.
      // NOTE: Ok this is awkward
      if (verifiedRequest instanceof Buffer) {
        console.log('Sending access token back to client')
        res.write(verifiedRequest);
        res.end();
        console.log("") // just for log readability
        return;
      }

      // If we get here, it means the Hub access token received is valid, proceed with handling the request.
      var requestMessage = verifiedRequest.request;
      console.log('Got message from client: ' + requestMessage);

      // generate and encrypt a response to the client
      // NOTE: Why do I pass the request to the response generator? What needs to get transferred between the two again?
      var responseMessage = requestMessage + ' Goodbye';
      var responseBuffer = await auth.getAuthenticatedResponse(verifiedRequest, responseMessage);

      // send response to client
      res.write(responseBuffer);
      res.end(); 
      console.log("") // just for log readability
    
    // Catch any exceptions and return an error to client
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.write(err.toString());
      res.end();
    }
  });

// Start the server
}).listen(8000, function() {
 console.log("server start at port 8000");
});