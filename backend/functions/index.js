const functions = require("firebase-functions");
const express = require("express");
const app = express();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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

// save current users state

// ask q

// give answer

// score

