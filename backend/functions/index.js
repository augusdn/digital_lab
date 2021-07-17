const functions = require("firebase-functions");
const express = require("express");
const app = express();
// const firebase = require("firebase");

// const { fetchQuestions } = require("./trivia");

// cors settings
const cors = require('cors');
app.use(cors({ origin: true }));
app.use(express.urlencoded())

const admin = require('firebase-admin');
admin.initializeApp();

async function resetSession(id) {
    var currentScore = 0;
    // update the total score by adding the current score to the total score
    // once it's done, delete the session
    admin.firestore().collection('user').doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                currentScore = doc.totalScore
            }
        })
        .catch((error) => {
            console.log(error)
        })
        admin.firestore().collection('user').doc(id).set({
            name: name,
            totalScore: currentScore,
            session: ''
        })
            .then(() => {
                console.log("Session reset!")
                return "Session for " + name + "has been reset.";
            })
            .catch((err) => {
                console.error(err);
                return "Error occured when resetting total score.";
            });
}

async function createUser(id, name) {
    admin.firestore().collection('user').doc(id).set({
        name: name,
        totalScore: 0,
        session: ''
    })
        .then(() => {
            console.log("Profile created!")
            return "Welcome to the team, " + name;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while creating profile.";
        });
}

// async function getUser(id) {
//     return await admin.firestore().collection('user').doc(id).get();
// }

async function getUser(id) {
    admin.firestore().collection('user').doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                console.log(doc);
                return doc;
            }
            else {
                console.log("no doc found!");
                createUser(id, "testName")
                    .then((ret) => {
                        console.log("getUser");
                        console.log(typeof (ret));
                        return ret;
                    })
                    .catch((err) => { console.error(err) });
                return "";
                // ask user to create an account!
            };
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while creating profile.";
        });
}

async function addSMS(msg) {
    console.log("addSMS");
    return admin.firestore().collection('sms').add(msg)
        .then((result) => {
            console.log("addsms promise");

            return new Promise((res, rej) => {
                if (result) {
                    console.log("Document: " + result.id + " added.");
                    res("Document: " + result.id + " added.");
                }
                else {
                    console.log("error on adding sms");
                    rej("error on adding sms");
                }
            })
        })
        .catch((err) => {
            console.error("error: " + err);
            return false;
        });
    // console.log("addsms end");

}


async function eventHandler(msg) {
    console.log("event handler start");
    // console.log(addSMS(msg));
    // console.log("@@@@@@@@@@");

    return addSMS(msg)
        .then((result) => {
            console.log("event handler promise 1");

            return new Promise((res, rej) => {
                if (result) {
                    console.log("SMS Saved");
                    res("sms saved");
                }
                else {
                    console.log("error on saving sms");
                    rej("error on saving sms");
                }
            })
        })
        .catch((err) => {
            console.error("event handler err");
        });
}

app.post('/', (req, res) => {
    // console.log("------------");
    // console.log(req.body);
    // console.log("------------");
    console.log("starting");

    eventHandler(req.body)
        .then((result) => {
            console.log("------------");
            res.contentType("text/xml");
            res.send(`
            <Response>
                <Message>${result}</Message>
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

exports.api = functions.region('australia-southeast1').https.onRequest(app);