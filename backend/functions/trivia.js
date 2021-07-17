
async function check_status(db, phone_number, res) {
    const status = db.collection("trivia")
        .doc(phone_number)
        .get("status")
    if (status == "answering") {
        if (check_trivia_answer(db, phone_number, res)) {
            return "Great Job!\n" + get_trivia_q(db, phone_number)
        } else {
            return "Better Luck next time\n" + get_trivia_q(db, phone_number)
        }
    }
}

async function get_trivia_q(db, phone_number) {
    const next_q = db.collection("trivia")
    .doc(phone_number)
    .get("next_question")
    
    // set new next q

    return next_q
}

async function check_trivia_answer(db, phone_number, user_answer) {
    const answer = db.collection("trivia")
    .doc(phone_number)
    .get("last_answer")
    if (user_answer.toLowerCase() != answer.toLowerCase()) {
        return True
    }
    return False
}

async function start_trivia(db, phone_number) {
    const data = {
        next_question: "",
        last_answer: "",
        question_list: [],
        current_score: 0
    }
    const res = await db.collection('trivia').doc(phone_number).set(data);
    const next_q = db.collection("trivia")
    .doc(phone_number)
    .get("next_question")
    if (next_q == null) {
        return get_trivia_answer(phone_number)
    }
    return next_q
}

// We should keep a total score of all trivias
// Each trivia play will have a different score/qs
// Should we save ^ + all the qs, answers, and answers they got???