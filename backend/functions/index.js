const functions = require("firebase-functions");
const express = require("express");
const app = express();
const MessagingResponse = require('twilio').twiml.MessagingResponse;


// const firebase = require("firebase");

// cors settings
const cors = require('cors');
app.use(cors({ origin: true }));
app.use(express.urlencoded())

const admin = require('firebase-admin');
admin.initializeApp();

app.post('/', (req, res) => {
    console.log("------------");
    console.log(req.body);
    console.log("------------");

    admin.firestore().collection('sms').add(req.body)
        .then((result) => {
            console.log(result.id);
            res.contentType("text/xml");
            res.send(`
            <Response>
                <Message> sms with ${result.id} added! </Message>
            </Response>
        `);
        })
        .catch((err) => {
            console.error(err);
            res.contentType("text/xml");
            res.send(`
            <Response>
                <Message> ERROR </Message>
            </Response>
        `);
        });
});

app.post("/trivia/sms", (request, response) => {
    const twiml = new MessagingResponse();
    if (request.body.Body == 'hello') {
        twiml.message('Hi!');
    } else if (request.body.Body == 'bye') {
        twiml.message('Goodbye');
    } else {
        twiml.message();
    }

    // Welcome message
    msg = "Welcome to TrivUs"

    // Trivia questions
    msg = "Trivia Q1...10"

    // Scoreboard
    msg = "Your score: ____"

    const twiml = new MessagingResponse();
    twiml.message(msg);
    response.writeHead(200, { 'Content-Type': 'text/xml' });
    response.end(twiml.toString());
});

exports.api = functions.region('australia-southeast1').https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

