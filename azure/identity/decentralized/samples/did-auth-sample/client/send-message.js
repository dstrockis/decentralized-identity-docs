//////////// Packages
// NOTE: there were vulns when installing pem-jwk
var pemJwk = require('pem-jwk');
var fs = require('fs');
var path = require('path');
var fetch = require('node-fetch');

// NOTE: I shouldn't have to install this, did-auth-jose should be self-contained
// NOTE: the npm package is out of date, and didn't tsc on npm install
// NOTE: Why do I have to load the RsaPrivateKey class like this?
// NOTE: getting deprecation warnings from crypto packages
var hub = require('@decentralized-identity/hub-node-core');
var didAuth = require('@decentralized-identity/did-auth-jose')
var RsaPrivateKey = require('@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey');

//////////// Constants
const discovery_endpoint = "https://beta.discover.did.microsoft.com/";
const server_endpoint = "http://localhost:8000";
const clientKeyId = "testKey";
const clientDid = 'did:test:7f2e100f-630a-4b16-a5f1-c17bafb70569';
const serverDid = 'did:test:973b194d-b02e-4d86-ae9e-f44793a0e470';

/////////// Load private key
// Read PEM RSA key and convert into JWT with the key ID registered on the ledger
const privatePem = fs.readFileSync(path.resolve(__dirname, './private.pem'), 'ascii');
const jwk = pemJwk.pem2jwk(privatePem);
jwk.kid = `${clientDid}#${clientKeyId}`;

// create RsaPrivateKey instance
// NOTE: the static method didn't work, and the .default()
// constructor is weird.
const key = new RsaPrivateKey.default({
    id: jwk.kid,
    type: 'RsaVerificationKey2018',
    publicKeyJwk: jwk
});

// convert key into dict of keys
// NOTE: why?
const keys = {};
keys[jwk.kid] = key;

/////////// static in-memory access token cache
var access_token = null; 

//////////// DID auth module setup 
// create Authentication class
// NOTE: not sure I really like this class name...
const resolver = new hub.HttpResolver(discovery_endpoint);
const auth = new didAuth.Authentication({
    keys,
    resolver
});

////////////// Functions
// makes an empty request without a token in order to get an access token from the server
async function getAuthenticationToken() {
    return new Promise(async function (resolve, reject) {

        // return the cached access token if we already have one
        if (access_token !== null) {
            resolve(access_token);
            return;
        }

        console.log('Getting access token from server');
        console.log("")

        // else go get one from the server, and cache it
        await makeRequest('').then(function(result) {
            access_token = result;
            resolve(access_token);
        },
        function(error) {
            reject(error);
        })
    });
}

// constructs and sends a message to the server
async function makeRequest(message, accessToken) {

    return new Promise(async function (resolve, reject) {

        // uses did-auth-jose to construct a properly formatted request
        // NOTE: did-auth-jose doesn't understand PEM format, so the dev needs to register DIDs
        // in JWK format on client & server. Need to update registration instructions to 
        // generate RSA key in JWK format.
        //
        // NOTE: our error messages already suck. Ex) "Error: JWK kid does not match Did publickey id"
        // would be better if you put the actual kid's in there.
        // 
        // NOTE: why do I need to pass key, isn't it already part of auth?
        //
        // NOTE: why does the DID doc have both an `id` and a `publicKeyJwk.kid` property, isn't
        // that redundant?
        //
        // NOTE: shouldn't I provide my DID somewhere, or is the key enough?
        const buffer = await auth.getAuthenticatedRequest(message, key, serverDid, accessToken);

        // if message is not empty, were sending a real
        // request (not an access token request)
        if (message != '') {
            console.log('Sending message to server: ' + message);
            console.log("")
        }

        // send the request to the server
        const res = await fetch(server_endpoint, {
            method: 'POST',
            body: buffer,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': buffer.length.toString()
            }
        });

        // catch errors in response
        if (res.status !== 200) {
            throw new Error(res.statusText);
        }

        // get the success response
        const response = await res.buffer();

        // decrypt and verify response from server
        const responseMessage = await auth.getVerifiedRequest(response, false);

        // check if the response is an access token, which would mean our previous
        // access token expired
        // NOTE: again this is awkward, it would be better if access token was its own type of request
        if (responseMessage instanceof Buffer) {
		    
            console.log('Access token expired, caching new access token.');
            access_token = responseMessage;
            throw new Error('Request failed due to an expired token, please retry your request.');
	    }

        // return the contents of the response
        // NOTE: calling this request is a bit weird
        resolve(responseMessage.request);
    });
}


//////////// Main script
function main() {

    // first get an access token (todo: explain why)
    getAuthenticationToken().then((accessToken) => {

        // send the message
        const message = 'Hello World';
        makeRequest(message, accessToken).then((response) => {

            // print the response from the server
            console.log('Got response from server: ' + response);
            console.log("")

        });
    });
}

main();