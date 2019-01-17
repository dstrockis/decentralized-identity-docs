var fs = require('fs');
var path = require('path');
var didAuth = require('@decentralized-identity/did-auth-jose');
var RsaPrivateKey = require('@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey');
var pemJwk = require('pem-jwk');
var http = require('https');

const keyId = "testKey";

// Convert PEM RSA key into JWK with correct key ID
const privatePem = fs.readFileSync(path.resolve(__dirname, './private.pem'), 'ascii');
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

async function generateJws() {

    body = {
        didMethod: 'test',
        hubUri: 'https://example.com',
        publicKey: [jwkPub],
    }

    // Generate & sign JWS, and log output to console
    const cryptoFactory = new didAuth.CryptoFactory([new didAuth.RsaCryptoSuite()]);
    const token = new didAuth.JwsToken(JSON.stringify(body), cryptoFactory);
    const signedRegistrationRequest = await token.sign(privateKey);
    console.log(signedRegistrationRequest);

}

generateJws();  