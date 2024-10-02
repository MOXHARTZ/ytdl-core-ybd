const got = require('got'),
    inquirer = require('@inquirer/prompts'),
    DIVIDER = '|----------------------|',
    DEVICE_API = 'https://oauth2.googleapis.com/device/code',
    TOKEN_API = 'https://oauth2.googleapis.com/token',
    CLIENT_ID = process.argv[2] || 'YOUR CLIENT ID HERE',
    CLIENT_SECRET = process.argv[3] || 'YOUR CLIENT SECRET HERE';

console.log(DIVIDER);
console.log('| Generate OAuth Token |');
console.log(DIVIDER);
console.log('|- OAuth2 Client Info -|');
console.log('| Client ID: ' + CLIENT_ID);
console.log('| Client Secret: ' + CLIENT_SECRET);
console.log(DIVIDER + '\n\n');

function errorHandler(error) {
    console.error('| Failed to update OAuth token.');
    console.error(DIVIDER);
    console.error('|    ↓ Details ↓     |');
    console.error(error);
}

function generateToken() {
    got.post(DEVICE_API, {
        form: {
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/youtube',
        },
        responseType: 'json',
    })
        .then(({ body: deviceApiResponse }) => {
            console.log(DIVIDER);
            console.log('|   Success Request1   |');
            console.log(`|     URL    : ${deviceApiResponse.verification_url}`);
            console.log(`| Device Code: ${deviceApiResponse.user_code}`);
            console.log(`|     Info   : Open the URL and follow the instructions.`);
            console.log(DIVIDER + '\n\n');

            inquirer
                .confirm({
                    message: 'Did you go to the end?',
                    default: true,
                })
                .then(() => {
                    got.post(TOKEN_API, {
                        form: {
                            client_id: CLIENT_ID,
                            client_secret: CLIENT_SECRET,
                            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                            device_code: deviceApiResponse.device_code,
                        },
                        responseType: 'json',
                    })
                        .then(({ body: tokenApiResponse }) => {
                            const OAUTH2_DATA = JSON.stringify(
                                {
                                    accessToken: tokenApiResponse.access_token,
                                    refreshToken: tokenApiResponse.refresh_token,
                                    expiryDate: new Date(Date.now() + tokenApiResponse.expires_in * 1000).toISOString(),
                                    clientData: {
                                        client_id: CLIENT_ID,
                                        client_secret: CLIENT_SECRET,
                                    },
                                },
                                null,
                                2,
                            );

                            console.log(OAUTH2_DATA);
                            console.log(DIVIDER);
                            console.log('| Important: The uniquely generated tokens may become unavailable if they are not updated for 2~3 days.');
                        })
                        .catch(errorHandler);
                })
                .catch(errorHandler);
        })
        .catch(errorHandler);
}

if (CLIENT_ID === 'YOUR CLIENT ID HERE' || CLIENT_SECRET === 'YOUR CLIENT SECRET HERE') {
    console.error(DIVIDER);
    console.error('| Missing Client ID or Client Secret.');
    console.error(DIVIDER);
} else {
    generateToken();
}
