const functions = require("firebase-functions");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const express = require("express");
const app = express();
// const firebase = require("firebase");

// cors settings
const cors = require('cors');
app.use(cors({ origin: true }));

const admin = require('firebase-admin');
admin.initializeApp();

app.get('/', (req, res) => {
    res.contentType("text/xml");
    res.send(`
        <Response>
            <Message> Good Luck! </Message>
        </Response>
    `);
});

exports.api = functions.region('australia-southeast1').https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });