const functions = require("firebase-functions");
const express = require("express");
const app = express();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.post("/trivia/sms", (request, response) => {
    // Welcome message
    msg = "Welcome to TrivUs"

    // Trivia questions
    msg = "Trivia Q1...10"

    // Scoreboard
    msg = "Your score: ____"

    const twiml = new MessagingResponse();
      twiml.message(msg);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
  });


