var fetch = require('node-fetch');
var didAuth = require('@decentralized-identity/did-auth-jose');
var HttpsProxyAgent = require('https-proxy-agent')

const hub_endpoint = "http://beta.personal.hub.microsoft.com/";
const hub_did = "did:test:hub.id";

class HubHelper {
  
	constructor(auth, key, did) {

    // static in-memory access token cache
    this.access_token = null; 

    // auth object contains private key details
		this.auth = auth;

    // private key loaded from file
    this.key = key,

    this.did = did
	}

    // Method to write arbitrary JSON to a hub
	async addJsonObject(json) {

        var that = this   

        return new Promise(async function (resolve, reject) {

            var message = await that.formatJsonAsHubRequest(json) 

            that.sendRequest(message).then(function (response) {
                resolve(response)
            }).catch(function (error) {
                reject(error)
            })
        })
	}

    // Method to write arbitrary JSON to a hub
	getJsonObjects(json) {

        var that = this   

        return new Promise(async function (resolve, reject) {

            // query hub for all objects of the given type
            var message = that.formatHubQueryRequest(json) 
            that.sendRequest(message).then(async function (response) {

                response = JSON.parse(response)
                var objects = []
                
                // for each object, query hub for all commits to that object
                await Promise.all(response.objects.map(async (item) => {

                    var message = that.formatHubReadRequest(item.id)
                    await that.sendRequest(message).then(function (response) {
                        
                        response = JSON.parse(response)
                        var most_recent_commit = {
                            'headers': {'committed_at': Date.parse(0)},
                            'body': {}
                        }

                        // iterate through commits and pick the most recent one - 
                        // this is the basic commit strategy
                        response.commits.forEach(function (commit) {
                            var headers = JSON.parse(Buffer.from(commit.protected, 'base64').toString('ascii'))
                            var body = JSON.parse(Buffer.from(commit.payload, 'base64').toString('ascii'))
                            
                            if (Date.parse(headers.committed_at) > most_recent_commit.headers.committed_at) {
                                most_recent_commit = {
                                    'headers': headers,
                                    'body': body
                                }
                            }
                            
                            // add the object to the to-do list to return
                            objects.push(most_recent_commit.body)
                        })

                    }).catch(function (error) {
                        reject(error)
                    })

                }));

                resolve(objects)

            }).catch(function (error) {
                reject(error)
            })
        })
	}

  // Send a read request to the hub
  formatHubQueryRequest(json) {
      var hubRequest = {
            '@context': 'https://schema.identity.foundation/0.1',
            '@type': 'ObjectQueryRequest',
            'iss': this.did,
            'aud': hub_did,
            'sub': this.did,
            'query': {
                'interface': 'Collections',
                'context': json['context'],
                'type': json['type'],
            }
      }

      return hubRequest
  }

  // Send a read request to the hub
  formatHubReadRequest(id) {
      var hubRequest = {
        '@context': 'https://schema.identity.foundation/0.1',
        '@type': 'CommitQueryRequest',
        'iss': this.did,
        'aud': hub_did,
        'sub': this.did,
        'query': {
            'object_id': [id],
        }
      }

      return hubRequest
  }

  // construct a hub request as (unsigned for now) JSON object
  // NOTE: target property in error message is great
  // NOTE: parameter is not expected type should list the expected type, link to docs
  // NOTE: everything is a server error, when they should be bad reqeusts
  async formatJsonAsHubRequest(json) {

    const commit_headers = {
        'interface': 'Collections',
        'context': json['@context'],
        'type': json['@type'],
        'operation': 'create', 
        'committed_at': new Date().toISOString(),
        'commit_strategy': 'basic', 
        'sub': this.did, 
    }

    const cryptoFactory = new didAuth.CryptoFactory([new didAuth.RsaCryptoSuite()]);
    const token = new didAuth.JwsToken(JSON.stringify(json), cryptoFactory);
    const signedJws = await token.sign(this.key, commit_headers);

    const parts = signedJws.split('.')

    var hubRequest = {
      '@context': 'https://schema.identity.foundation/0.1',
      '@type': 'WriteRequest',
      'iss': this.did,
      'aud': hub_did,
      'sub': this.did,
      
      'commit': {
    
        // NOTE: why do we have to base64 stuff?
        'protected': parts[0],
        
        // NOTE: why are protected & payload strings, but header is json?
        'header': {
            // 'rev': '3a9de008f526d239...',
            // 'iss': 'did:example:123456'
        },
        
        'payload': parts[1],

        // NOTE: all commits have to be signed?
        'signature': parts[2]
      }
    }

    return hubRequest

  }

  // makes an empty request without a token in order to get an access token from the hub
  getAuthenticationToken() {

      var that = this

      return new Promise(async function (resolve, reject) {

          // return the cached access token if we already have one
          if (that.access_token !== null) {
              resolve(that.access_token);
              return;
          }

          // else go get one from the server, and cache it
          await that.makeRequest('').then(function(result) {
              that.access_token = result;
              resolve(that.access_token);
          },
          function(error) {
              reject(error);
          })
      });
  }

  // sends a message to the hub
  makeRequest(message) {

      var that = this

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
          const buffer = await that.auth.getAuthenticatedRequest(message, that.key, hub_did, that.access_token);

          // send the request to the hub
          const res = await fetch(hub_endpoint, {
              method: 'POST',
              body: buffer,
              headers: {
                  'Content-Type': 'application/jwt',
                  'Content-Length': buffer.length.toString()
              },
              agent: new HttpsProxyAgent('http://127.0.0.1:8888'),
          });

          // catch errors in response
          if (res.status !== 200) {
              throw new Error(res.statusText);
          }

          // get the success response
          const response = await res.buffer();

          // decrypt and verify response from server
          const responseMessage = await that.auth.getVerifiedRequest(response, false);

          // check if the response is an access token, which would mean our previous
          // access token expired
          // NOTE: again this is awkward, it would be better if access token was its own type of request
          if (responseMessage instanceof Buffer) {
          
              that.access_token = responseMessage;
              throw new Error('Request failed due to an expired token, please retry your request.');
        }

          // return the contents of the response
          // NOTE: calling this request is a bit weird
          // NOTE: unexpected token H in JSON error on malformed request to hub
          resolve(responseMessage.request);
      });
  }

  sendRequest(message) {

    var that = this

    return new Promise(async function (resolve, reject) {

      // first get an access token (todo: explain why)
      that.getAuthenticationToken().then((accessToken) => {

        // send the message
        that.makeRequest(message, accessToken).then((response) => {

            resolve(response);

        }).catch(function (error) {
          reject(error)
        });
      }).catch(function (error) {
          reject(error)
      });
    })
  }
}
	
module.exports = HubHelper 




