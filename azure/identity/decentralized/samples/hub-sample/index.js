const minimist = require('minimist')
var hubHelper = require('./hub-helper.js')
// NOTE: there were vulns when installing pem-jwk
var pemJwk = require('pem-jwk');
var fs = require('fs');
var path = require('path');

// NOTE: I shouldn't have to install this, did-auth-jose should be self-contained
// NOTE: the npm package is out of date, and didn't tsc on npm install
// NOTE: Why do I have to load the RsaPrivateKey class like this?
// NOTE: getting deprecation warnings from crypto packages
var hub = require('@decentralized-identity/hub-node-core');
var didAuth = require('@decentralized-identity/did-auth-jose')
var RsaPrivateKey = require('@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey');

//////////// Constants
const discovery_endpoint = "https://beta.discover.did.microsoft.com/";
const keyId = "testKey";
const userDid = 'did:test:183ff1bf-6197-4dc4-bee6-e5b640ac4958';

/////////// Load private key
// Read PEM RSA key and convert into JWT with the key ID registered on the ledger
const privatePem = fs.readFileSync(path.resolve(__dirname, './private.pem'), 'ascii');
const jwk = pemJwk.pem2jwk(privatePem);
jwk.kid = `${userDid}#${keyId}`;

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

//////////// DID auth module setup 
// create Authentication class
// NOTE: not sure I really like this class name...
const resolver = new hub.HttpResolver(discovery_endpoint);
const auth = new didAuth.Authentication({
    keys,
    resolver
});

// setup a connection to the hub using the private key
var hub = new hubHelper(auth, key, userDid)

// CLI commands
module.exports = () => {
  
  const args = minimist(process.argv.slice(2))
  const cmd = args._[0]

  switch (cmd) {
    case undefined:
      console.log('Welcome to hub to-do! Run \'todo help\' for a list of commands.')
      break
    case 'add':
      addToDo(args)
      break
    case 'list':
      listToDos()
      break
    case 'remove':
    case 'edit':
    case 'help':
      help()
      break
    default:
      console.error(`"${cmd}" is not a valid command...`)
      process.exit(1)    
  }
}

// Help menu for CLI
function help() {

  mainHelp = `
    todo [command] <options>

    ***
    Note, before running the commands below, you need to follow
    the steps in the README, including registering a DID and
    placing a private key in the proper location.
    ***

    add .............. add an item to the user's to-do list
        --text <value> ............... the text for the new item
    remove ............ remove an item from the user's to-do list
        --id <value> ................. the id for the item to remove
    edit ............ update the text for an item in the user's to-do list
        --id <value> ................. the id for the item to remove
        --text <value> ............... the updated text for the item
    list ............ list all items in the user's to-do list
    help ............... show help menu


  `

  console.log(mainHelp)
}

// Add an item to the user's hub
function addToDo(args) {
  console.log('Adding a to-do item...')

  if (args.text === undefined || args.text === '') {
    console.error('Please provide a valid text string')
    process.exit(1)
  }

  var item = { 
    '@context': 'http://strockisdev.org',
    '@type': 'ToDoItem',
    'text': args.text,
  }

  hub.addJsonObject(item).then(function(response) {

    console.log('Hub write request completed.')

  }).catch(function(error) {

    console.error('Hub write request failed.')
    process.exit(1)

  })
}

// List to-do items in the user's hub
function listToDos() {
  console.log('Getting all to-do items in hub...')

  var item = { 
    '@context': 'http://strockisdev.org',
    '@type': 'ToDoItem',
  }

  hub.getJsonObjects(item).then(function(response) {

    response.forEach(function (item) {
      console.log(item.text)
    })

  }).catch(function(error) {

    console.error('Hub read request failed.')
    console.error(error)
    process.exit(1)

  })
}