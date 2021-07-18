const functions = require("firebase-functions");
const express = require("express");
const app = express();
// const firebase = require("firebase");

const axios = require('axios');

// cors settings
const cors = require('cors');
app.use(cors({ origin: true }));
app.use(express.urlencoded())

const admin = require('firebase-admin');
admin.initializeApp();


async function fetchQuestions(n = 10, cat = "", diff = "") {
    var url = "https://opentdb.com/api.php?";
    const categories = [9, 17, 21, 22, 23];
    const difficulty = ["easy", "medium", "hard"];

    if (0 > n && n > 50) n = 10;
    if (0 >= cat && cat > 9) cat = "";
    if ((diff != 1) && (diff != 2) && (diff != 3)) diff = "";

    url += "amount=" + n;
    if (cat) {
        // console.log(cat);
        url += "&category=" + categories[cat - 1];
    }
    if (diff) {
        // console.log(diff);
        url += "&difficulty=" + difficulty[diff - 1];
    }

    console.log(url);

    const config = {
        method: 'get',
        url: url
    }

    let res = await axios(config)

    console.log(res.status);
    // console.log(res.data);
    return res.data.results;
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
}

async function createUser(id, name) {
    return admin.firestore().collection('user').doc(id).update({
        name: name,
        totalScore: 0,
        status: 'ideal'
    })
        .then(() => {
            console.log("Profile created!")
            return "Welcome to the game, " + name + "\nReply with 'Start' to start the quizz.";
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while creating profile.";
        });
}

async function register(id) {
    return admin.firestore().collection('user').doc(id).set({
        name: id,
        totalScore: 0,
        status: 'register'
    })
        .then(() => {
            console.log("Profile created!")
            return "Welcome to TrivUs!!! We are very excited to have you on board! What should we call you? (reply with your nick name)";
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while creating profile.";
        });
}

async function getUser(id) {
    return admin.firestore().collection('user').doc(id).get()
        .then((doc) => {
            return doc;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while getting profile.";
        });
}

async function getQuizNum(id) {
    return admin.firestore().collection('user').doc(id).update({
        status: 'number'
    })
        .then(() => {
            console.log("get quiz number")
            return "Welcome to the trivus.\nHow many questions do you want? (numbers between 1-50)";
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while setting up the quiz.";
        });
}

async function getQuizCat(id, body) {
    return admin.firestore().collection('user').doc(id).update({
        "status": 'cat',
        session: { num: body }
    })
        .then(() => {
            console.log("get quiz category");
            const categories = [
                "All Categories",
                "General Knowledge",
                "Science and Nature",
                "Sports",
                "Geography",
                "History"
            ]
            var str = "Select the category!"
            for (let i = 0; i < categories.length; i++) {
                str += "\n" + i.toString() + " - " + categories[i];
            }
            str += "\nReply back with single number.";
            console.log(str)
            return str;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while setting up the quiz.";
        });
}

async function getQuizDiff(id, body) {
    return admin.firestore().collection('user').doc(id).update({
        "status": 'diff',
        "session.category": body
    })
        .then(() => {
            console.log("get quiz difficulty");
            var str = "Choose the difficulty.\n1 - Easy\n2 - Medium\n3 - Hard"
            console.log(str)
            return str;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while setting up the quiz.";
        });
}

async function getQuizType(id, body) {
    return admin.firestore().collection('user').doc(id).update({
        "status": 'type',
        "session.difficulty": body
    })
        .then(() => {
            console.log("get quiz type");
            var str = "Choose Quiz Type.\n1 - Multiple Choice\n2 - True/False"
            console.log(str)
            return str;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while setting up the quiz.";
        });
}

async function startQuiz(id, body, session) {
    let quiz = await fetchQuestions(session['num'], session['category'], session['difficulty'], body);
    console.log(quiz);

    return admin.firestore().collection('user').doc(id).update({
        status: 'started',
        quiz: quiz
    })
        .then(() => {
            console.log("fetch quiz");
            var str = "starting"
            return str;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while setting up the quiz.";
        })
        .then(() => {
            console.log("starting quizz");
            var str = "quiz1"
            return deliverQuiz(id, quiz, session, "", 0);
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while starting the quiz.";
        });
}

async function deliverQuiz(id, quiz, session, ans, index) {
    let score = 0;
    let msg = "";
    let status = "started";
    if (index > 0) {
        score = session['current_score'];
        if (ans == 1) {
            score += 1;
            msg = "Thats Correct!\n";
        }
        else {
            msg = "Correct answer was " + quiz[index - 1]['correct_answer'] + "\n";
        }
    }
    if (index >= Object.keys(quiz).length - 1) {
        status = "end";
    }
    return admin.firestore().collection('user').doc(id).update({
        "status": status,
        "session.index": index + 1,
        "session.current_score": score,
    })
        .then(() => {
            console.log("quizz #" + (index + 1).toString());
            msg += "Q" + (index + 1).toString() + ". ";
            msg += quiz[index]['category'] + ", ";
            msg += quiz[index]['difficulty'] + "\n";
            msg += quiz[index]['question'] + "\n1. ";
            msg += quiz[index]['correct_answer'] + " ";
            for (let i = 0; i < Object.keys(quiz[index]['incorrect_answers']).length; i++) {
                msg += (i + 2).toString() + "." + quiz[index]['incorrect_answers'][i] + " ";
            }
            return msg;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while delivering the quiz.";
        });
}

async function endQuiz(id, quiz, session, ans, index, totalScore) {
    let score = 0;
    let msg = "";
    let status = "started";
    if (index > 0) {
        score = session['current_score'];
        if (ans == 1) {
            score += 1;
            msg = "Thats Correct!\n";
        }
        else {
            msg = "Correct answer was " + quiz[index - 1]['correct_answer'] + "\n";
        }
    }
    let t = totalScore + score;
    return admin.firestore().collection('user').doc(id).update({
        status: "score",
        session: "",
        quiz: "",
        totalScore: t
    })
        .then(() => {
            console.log("quizz over");
            msg += "Well done, your final score is " + score + "\nReply back with anything";
            return msg;
        })
        .catch((err) => {
            console.error(err);
            return "Error occured while ending the quiz.";
        });
}

async function updateScoreboard(id) {
    return admin.firestore().collection('user').doc(id).update({
        status: "ideal"
    })
        .then(() => {
            return admin.firestore().collection('user').orderBy("totalScore", "desc").limit(10).get()
                .then((docs) => {
                    console.log('----');
                    let ranking = []
                    let i = 1;
                    let msg = "";
                    docs.forEach(d => {
                        console.log(d.data().name);
                        // console.log(i);
                        msg += "Rank: " + i + "|Name: " + d.data().name + "|Score: " + d.data().totalScore + "\n";
                        // ranking.push({
                        //     rank: i,
                        //     name: d.data().name,
                        //     score: d.data().totalScore
                        // });
                        i += 1
                    })
                    msg += "\nReply back anytime to restart the trivia.";
                    console.log(msg);
                    return msg;
                })
        })
        .catch()
}

async function eventHandler(msg) {
    console.log("event handler start");

    // addSMS(msg)
    //     .then((result) => {
    //         console.log("event handler promise 1");
    //         if (result) {
    //             console.log("SMS Saved");
    //         }
    //         else {
    //             console.error("error on saving sms");
    //         }
    //     })
    //     .catch((err) => {
    //         console.error("addSMS err");
    //     });

    return getUser(msg.From)
        .then((profile) => {
            if (profile.exists) {
                console.log("user exist");
                console.log(profile.data().status);
                const status = profile.data().status;
                switch (status) {
                    case 'register':
                        console.log("registering user");
                        return createUser(msg.From, msg.Body);
                        break;
                    case 'ideal':
                        console.log("start quiz");
                        return getQuizNum(msg.From);
                        break;
                    case 'number':
                        console.log("start quiz 2");
                        return getQuizCat(msg.From, msg.Body);
                        break;
                    case 'cat':
                        console.log("start quiz 3");
                        return getQuizDiff(msg.From, msg.Body);
                        break;
                    case 'diff':
                        console.log("start quiz 4");
                        return getQuizType(msg.From, msg.Body);
                        break;
                    case 'type':
                        console.log("start quiz 5");
                        return startQuiz(msg.From, msg.Body, profile.data().session);
                        break;
                    case 'started':
                        console.log("on progress");
                        return deliverQuiz(msg.From, profile.data().quiz, profile.data().session, msg.Body, profile.data().session['index']);
                        break;
                    case 'end':
                        console.log("finished!");
                        return endQuiz(msg.From, profile.data().quiz, profile.data().session, msg.Body, profile.data().session['index'], profile.data().totalScore);
                        break;
                    case 'score':
                        console.log("finished!");
                        return updateScoreboard(msg.From);
                        break;
                }
            }
            else {
                console.log("user doesn't exist");
                console.log("creating a new user");
                return register(msg.From);
            }
        })
}

app.post('/', (req, res) => {
    // console.log("------------");
    // console.log(req.body);
    // console.log("------------");
    console.log("starting");

    eventHandler(req.body)
        .then((result) => {
            console.log("------------");
            let msg = result.replace("&", " and ");
            console.log(result);
            res.contentType("text/xml");
            res.send(`
            <Response>
                <Message>${msg}</Message>
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