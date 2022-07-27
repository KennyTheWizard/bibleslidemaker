const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const getSections = require('./testesl');
const getIncarnation = require('./testformattingIncar');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/presentations'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Slides API.
  authorize(JSON.parse(content), listSlides);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the number of slides and elements in a sample presentation:
 * https://docs.google.com/presentation/d/1EAYk18WDjIG-zp_0vLm3CsfQh_i8eXc67Jo2O9C6Vuc/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listSlides(auth) {
    const slides = google.slides({version: 'v1', auth});
    const presentation = getIncarnation();
    for (const section of presentation)
    {
        console.log(section);
        const presentationId = '1wR9nkF5uOBsvvmfRZTsikUchEba3mAXAa3sYZDIN4hc';
        const respSlide = await slides.presentations.batchUpdate({ presentationId, requestBody: {
            requests: [{ createSlide: { } }]
        }});
        await waitTime(1000);
        const slideId = respSlide.data.replies[0].createSlide.objectId;
        const respShape = await slides.presentations.batchUpdate({ presentationId, requestBody: {
            requests: [{ 
                createShape: { 
                    elementProperties: {
                        pageObjectId: slideId,
                        "size": {
                            "width": {
                              "magnitude": 3000000,
                              "unit": "EMU"
                            },
                            "height": {
                              "magnitude": 3000000,
                              "unit": "EMU"
                            }
                          },
                          "transform": {
                            "scaleX": 3.048,
                            "scaleY": 1.7239,
                            "translateX": 16200,
                            "translateY": 8100,
                            "unit": "EMU"
                        },
                    },
                    shapeType: 'TEXT_BOX',
                }
            }]
        }});
        await waitTime(1000);
        const shapeId = respShape.data.replies[0].createShape.objectId;
        const respText = await slides.presentations.batchUpdate({ presentationId, requestBody: {
            requests: [{ 
                insertText: { objectId: shapeId, text: section}
            }]
        }});
        await waitTime(1000);
        const respStyle= await slides.presentations.batchUpdate({ presentationId, requestBody: {
            requests: [{ 
                updateTextStyle: {
                    fields: '*',
                    objectId: shapeId,
                    style: {
                        fontSize: {
                            magnitude: '36',
                            unit: 'PT'
                        },
                        foregroundColor: {
                            opaqueColor: {
                                themeColor: 'LIGHT1'
                            }
                        }
                    }
                },
            }]
        }});
        await waitTime(1000);
        const respStyleColor= await slides.presentations.batchUpdate({ presentationId, requestBody: {
            requests: [{ 
                updateShapeProperties: {
                    fields: "shapeBackgroundFill.solidFill.color",
                    objectId: shapeId,
                    shapeProperties: {
                        shapeBackgroundFill: {
                            solidFill: {
                                color: {
                                    themeColor: 'DARK1'
                                }
                            }
                        }
                    }
                }
            }]
        }});
        await waitTime(1000);
        console.log(respText.data.replies)

        
    }
}

async function waitTime(time)
{
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    })
}