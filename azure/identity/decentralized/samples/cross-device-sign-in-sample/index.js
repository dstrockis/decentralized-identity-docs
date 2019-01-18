////////////// Node packages
var http = require('http');
var pemJwk = require('pem-jwk');
var fs = require('fs');
var path = require('path');
const express = require('express')
var cors = require('cors')
var session = require('express-session')
var bodyParser = require('body-parser')

//////////////// DID specific packages
var hub = require('@decentralized-identity/hub-node-core');
var didAuth = require('@decentralized-identity/did-auth-jose')
var RsaPrivateKey = require('@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey');

///////////// Constants
const discovery_endpoint = "https://beta.discover.did.microsoft.com/";
const serverKeyId = "testKey";
const serverDid = "did:test:7716159d-ab92-4771-aacd-b491f72dfc3f"; //PUT IN YOUR REGISTERED DID HERE

///////////// Load the server's DID private key
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
const app = express()
const port = process.env.PORT || 1337;

var corsOptions = {
  methods: ['POST', 'GET', 'OPTIONS']
}
app.use(cors(corsOptions))

// Set up cookie based sessions
app.use(session({
  secret: 'cookie-secret-key',
  resave: false,
  saveUninitialized: true
}))

// require sign-in for all routes except 
// home, login, and auth-response
app.use(function (req, res, next) {

  if (['/', '/login', '/auth-response', '/auth-request'].indexOf(req.path) >= 0) {
    return next()
  }

  if (!req.session.did) {
     return res.status(401).send("Unauthorized, please log in.")
  }
 
  next()
})

// serve index.html as the home page
app.get('/', function (req, res) { 
  res.sendFile('index.html', {root: __dirname})
})

// ajax request to see if the user is signed in
app.get('/check-session', function (req, res) { 
  res.send(`Successfully logged in as ${req.session.did}`)
})

// ajax request to get an OpenID Connect request (OIDC section 6.2)
app.get('/login', function (req, res) { 

  // the URI for the signed auth request
  var request_uri = req.protocol + '://' + req.get('host') + '/auth-request?session=' + req.session.id 
  
  // OIDC self-issued says client_id must be redirect_uri
  var redirectUrl = req.protocol + '://' + req.get('host') + '/auth-response'

  // form OIDC request using request_uri parameter
  var oidc_request = `openid://` +
                    `?response_type=id_token` +
                    `&client_id=${redirectUrl}` +
                    `&request_uri=${request_uri}` +
                    `&state=some-random-text-needed-due-to-bug-in-qr-library` +
                    `&scope=openid`

  res.send(oidc_request)
})

// request from user agent to get a signed request (OIDC section 6.2)
app.get('/auth-request', function (req, res) {

  // generate auth request using OpenID Connect self-issued syntax
  var redirectUrl = req.protocol + '://' + req.get('host') + '/auth-response'
  authRequest = {
    iss: serverDid,
    response_type: 'id_token',
    client_id: redirectUrl,
    scope: 'openid',
    state: undefined,
    nonce: req.query.session,
    claims: undefined
  }

  // sign auth request and produce JWS to send to client
  auth.signAuthenticationRequest(authRequest).then(function (authReqJws) {
    res.send(authReqJws)
  }).catch(function (error) {
    res.status(500).send(error)
  })

})

// ajax request to receive auth response from user agent
// expects incoming response in JWS format
var textParser = bodyParser.text({ type: 'application/jwt' })
app.post('/auth-response', textParser, function (req, res) {

  // validate an incoming DID authentication response
  auth.verifyAuthenticationResponse(req.body).then(function(authResponse) {

    // validate the nonce in the returned authentication response
    if (authResponse.nonce != req.session.id)
      throw 'Nonce in auth response did not match nonce in session cookie.'

    // bind the session to the DID included in the response
    req.session.did = authResponse.sub;
    res.status(200).json();

  }).catch(function(error) {
    res.status(401).send('Unable to verify authentication response: ' + error);
  })
})

// wipe the session to log the user out, and redirect to home page
app.get('/logout', function(req, res) {
  req.session.did = null
  res.redirect('/')
})

// start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))