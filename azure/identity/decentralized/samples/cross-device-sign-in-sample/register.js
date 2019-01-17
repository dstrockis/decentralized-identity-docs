var fs = require('fs');
var path = require('path');
var didAuth = require('@decentralized-identity/did-auth-jose');
var RsaPrivateKey = require('@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey');
var pemJwk = require('pem-jwk');
var http = require('https');

const serverKeyId = "testKey";

///////////// Load private key
// Convert PEM RSA key into JWK with correct key ID
const privatePem = fs.readFileSync(path.resolve(__dirname, './server/private.pem'), 'ascii');
const jwkPriv = pemJwk.pem2jwk(privatePem);
jwkPriv.kid = serverKeyId;

// Convert PEM RSA key into JWK with correct key ID
const publicPem = fs.readFileSync(path.resolve(__dirname, './server/public.pem'), 'ascii');
const jwkPub = pemJwk.pem2jwk(publicPem);
jwkPub.kid = serverKeyId;

// create RsaPrivateKey instance
const privateKey = new RsaPrivateKey.default({
    id: jwkPriv.kid,
    type: 'RsaVerificationKey2018',
    publicKeyJwk: jwkPriv
});

async function registerDid() {

    body = {
        didMethod: 'test',
        hubUri: 'https://beta.personal.hub.microsoft.com',
        publicKey: [jwkPub],
    }

    const cryptoFactory = new didAuth.CryptoFactory([new didAuth.RsaCryptoSuite()]);
    const token = new didAuth.JwsToken(JSON.stringify(body), cryptoFactory);
    const signedRegistrationRequest = await token.sign(privateKey);

    console.log(signedRegistrationRequest)

    var post_data = signedRegistrationRequest

    // An object of options to indicate where to post to
    var post_options = {
        host: 'beta.register.did.microsoft.com',
        path: '/api/v1.1',
        method: 'POST',
        headers: {
            'Content-Type': 'application/jwt',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    console.log('sending...')

    // post the data
    post_req.write(post_data);
    post_req.end();
}

registerDid();