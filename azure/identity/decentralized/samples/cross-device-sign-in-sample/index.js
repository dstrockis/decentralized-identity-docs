////////////// Node packages
var http = require('http');
var pemJwk = require('pem-jwk');
var fs = require('fs');
var path = require('path');
const express = require('express')
var cors = require('cors')
var session = require('express-session')
var bodyParser = require('body-parser')
var MemoryStore = require('memorystore')(session)

//////////////// DID specific packages
var hub = require('@decentralized-identity/hub-node-core');
var didAuth = require('@decentralized-identity/did-auth-jose')
var RsaPrivateKey = require('@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey');

///////////// Constants
const discovery_endpoint = "https://beta.discover.did.microsoft.com/";
const serverKeyId = "testKey";
const serverDid = "did:test:1a00b6e1-8d25-4d54-901e-5521dd615f58"; //PUT IN YOUR REGISTERED DID HERE

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
sessionStore = new MemoryStore()
app.use(session({
  store: sessionStore,
  secret: 'cookie-secret-key',
  resave: false,
  saveUninitialized: true
}))

// require sign-in for all routes except login-related routes & home page
app.use(function (req, res, next) {

  if (['/', '/login', '/logout', '/auth-response', '/auth-pending', '/auth-request', '/auth-confirm'].indexOf(req.path) >= 0) {
    return next()
  }

  if (!req.session.did) 
    return res.status(401).send();
 
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
                    `&response_mode=form_post` +
                    `&client_id=${redirectUrl}` +
                    `&request_uri=${request_uri}` +
                    `&state=some-random-text-needed-due-to-bug-in-qr-library` +
                    `&scope=openid`

  console.log(oidc_request)
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
    state: req.query.session,
    nonce: undefined,
    claims: undefined
  }

  // sign auth request and produce JWS to send to client
  auth.signAuthenticationRequest(authRequest).then(function (authReqJws) {
    res.type('application/jwt');
    res.send(authReqJws)
  }).catch(function (error) {
    res.status(500).send(error)
  })
})

// ajax request to receive auth response from user agent
// expects incoming response in JWS format
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.post('/auth-response', urlencodedParser, function (req, res) {

    // load the user's' session from the session store
    sessionStore.get(req.body.state, async function (error, sesh) {
      
      if (error)
        throw new Error('Could not find matching session for authenication response.');
      
      var fiveMinsFromNow = new Date(Date.now() + (5 * 60 * 1000));
      sesh.pendingReq = {"exp": fiveMinsFromNow}

      // if the user agent returns an error, record the error in the session
      if (req.body.error) {
        sesh.pendingReq.error = req.body.error_description;
      }

      // if no error occurred, validate the id_token
      if (req.body.id_token) {

        try {

          var authResponse = await auth.verifyAuthenticationResponse(req.body.id_token);

          // the user is not signed-in yet; they need to match the user_code provided
          sesh.pendingReq.did = authResponse.sub;
          sesh.pendingReq.user_code = authResponse.user_code;

        } catch (err) {
          return res.status(401).send('Unable to verify authentication response: ' + error);
        }
      }

      // update the user's session with the results of the pending sign-in
      sessionStore.set(req.body.state, sesh, function (err) {

        if (err)
          throw new Error('Could not save updated session.'); 

        return res.status(204).send();
      
      })
  });
})

// ajax request to see if there is a pending authenication
// request that the user can fulfill
app.get('/auth-pending', function (req, res) {
  
  // if a valid pending request exists
  var currentTime = new Date();
  if (req.session.pendingReq && currentTime <= Date.parse(req.session.pendingReq.exp)) {

    // if an error occurred in the request, return it to the client
    // and then clear the pending request.
    if (req.session.pendingReq.error) {
      var auth_error = req.session.pendingReq.error;
      req.session.pendingReq = null;
      return res.json({"auth_error": auth_error});
    }

    // otherwise, there is a valid pending request, return 200 w/o error
    return res.json({});
  }

  // if there is not a pending request, return not found
  return res.status(404).send();

})

// ajax request to receive auth response from user agent
// expects incoming response in OIDC form_post format
var jsonParser = bodyParser.json()
app.post('/auth-confirm', jsonParser, function (req, res) {

  // if there's no valid pending request
  var currentTime = new Date();
  if (!req.session.pendingReq || currentTime > Date.parse(req.session.pendingReq.exp))
    return res.status(401).send('Your sign in request may have expired. Please try signing in again.');

  // if incoming user_code matches pending user code, 
  // sign in the user and return success
  if (req.body.user_code == req.session.pendingReq.user_code) {
    req.session.did = req.session.pendingReq.did;    
    req.session.pendingReq = null;
    return res.status(204).send();
  }

  // if incoming user_code does not match a pending code
  if (req.body.user_code != req.session.pendingReq.user_code) {
    return res.status(401).send(`The code ${req.body.user_code} is not correct, please try again.`);
  }
})

// wipe the session to log the user out, and redirect to home page
app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) 
      throw err;

    res.redirect('/');
  })
})

// start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))