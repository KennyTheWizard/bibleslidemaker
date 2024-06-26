const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const getSectionsBible = require('./fetchEsl');
const getIncarnation = require('./testformattingIncar');
const parseHymn = require('./testformattinghymn');
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
    console.log(process.argv[2]);
    const inputJson = require(process.argv[2]);

    const presentationId = inputJson.presentationId;

    const mountainVerse = inputJson.mountainverse;
    if (mountainVerse) {
        await createTitleCard(slides, presentationId, mountainVerse.replaceAll('+', ' '));
        const mountainSection = await getSectionsBible(mountainVerse);
        console.log(mountainSection);
        await createBodyFromSections(slides, presentationId, mountainSection);
    }

    let lastPsalm = '';
    for (var psalm of inputJson.psalms ?? [])
    {
        await createTitleCard(slides, presentationId, "Psalm " + psalm);
        let psalmBeforeColon = psalm.split(':')[0];
        if (psalmBeforeColon != lastPsalm) {
            const sections = await getIncarnation(`./treasuryOfDavid/psalm${psalmBeforeColon}.txt`);
            await createBodyFromSections(slides, presentationId, sections);
        }
        lastPsalm = psalmBeforeColon;
        await createTitleCard(slides, presentationId, psalm);

    }
    for (var passage of inputJson.passages ?? [])
    {
        const { reference, passage: sections } = await getSectionsBible(passage);
        await createTitleCard(slides, presentationId, reference);
        console.log(reference, sections);
        await createBodyFromSections(slides, presentationId, sections);
    }

    for (var additionalItems of inputJson.additional ?? [])
    {
        await createTitleCard(slides, presentationId, additionalItems.title);
        const sections = await getIncarnation(additionalItems.file);
        await createBodyFromSections(slides, presentationId, sections);
    }
    await createVideos(slides, presentationId, inputJson.videos);

    for (var hymn of inputJson.paradiseHymn ?? [])
    {
        await createTitleCard(slides, presentationId, hymn.title);
        const sections = await parseHymn(hymn.file);
        await createBodyFromSections(slides, presentationId, sections);
    }
}

async function createVideos(slides, presentationId, videoUrls)
{
    const regexUrl = /v=(.{11})/;
    for (const videoUrl of videoUrls ?? [])
    {

        const videoId = regexUrl.exec(videoUrl)[1]
        const respSlide = await slides.presentations.batchUpdate({ presentationId, requestBody: {
            requests: [{ createSlide: { } }]
        }});
    
        const addVideo = await slides.presentations.batchUpdate({ presentationId, requestBody: {
            requests: [
                {
                    createVideo: {
                        source: 'YOUTUBE',
                        id: videoId,
                        elementProperties: {
                            pageObjectId: respSlide.data.replies[0].createSlide.objectId,
                            "size": {
                                "width": {
                                  "magnitude": 12000,
                                  "unit": "EMU"
                                },
                                "height": {
                                  "magnitude": 9000,
                                  "unit": "EMU"
                                }
                              },
                              "transform": {
                                "scaleX": 762,
                                "scaleY": 571.5,
                                "unit": "EMU"
                              }
                        }
                    }
                }
            ]
        }});
    }
}

async function createTitleCard(slides, presentationId, title)
{
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
                        "scaleY": 1.7145,
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
            insertText: { objectId: shapeId, text: title }
        }]
    }});
    await waitTime(1000);

    const respStyle= await slides.presentations.batchUpdate({ presentationId, requestBody: {
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
                    },

                    
                }
            },
        },
        { 
            updateShapeProperties: {
                fields: "contentAlignment",
                objectId: shapeId,
                shapeProperties: {
                    contentAlignment: "MIDDLE",
                }
            },
        },
        {
            updateTextStyle: {
                fields: '*',
                objectId: shapeId,
                style: {
                    fontSize: {
                        magnitude: '56',
                        unit: 'PT'
                    },
                    foregroundColor: {
                        opaqueColor: {
                            themeColor: 'LIGHT1'
                        }
                    },  
                },
            },
        },
        {
            updateParagraphStyle: {
                fields: 'alignment',
                objectId: shapeId,
                style: {
                    alignment: 'CENTER'
                }
            }
        }
    ]
    }});
    await waitTime(1000);
    console.log(respStyle.data.replies)

}

async function createBodyFromSections(slides, presentationId, bodySections)
{
    for (const section of bodySections)
    {
        console.log(section);
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
                            "scaleY": 1.7145,
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
                insertText: { objectId: shapeId, text: section.trim()}
            },
            { 
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
                        },
                    }
                }
            },
            { 
                updateShapeProperties: {
                    fields: "contentAlignment",
                    objectId: shapeId,
                    shapeProperties: {
                        contentAlignment: "MIDDLE",
                    }
                }
            },
            { 
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
            }
        ]
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
