/* statuses: 
    - "" - new account (ask if want to play trivia)
    - "start" - want to start trivia (ask for options - number of qs)
    - "difficulty" - want to start trivia (ask for options - difficulty)
    - "category" - want to start trivia (ask for options - category)
    - "trivia_time" - in the process of trivia (check answer + get next q - if done, get score of current round)
    - "" - done with trivia (view total score)
*/
async function check_status(db, phone_number, res) {
    const user = db.collection("trivia")
        .doc(phone_number)
        .get()
    if (!user.exists) {
        // create document
        create_user(db, phone_number)
        welcomemsg = ""
        return welcomemsg
    }
    const status = user.data["status"]
    if (status == "") {
        if (res) {
            db.collection("trivia")
                .doc(phone_number)
            return show_trivia()
        }
    }
    if (status == "trivia_time") {
        if (check_trivia_answer(db, phone_number, res)) {
            msg = "Great Job!\n"
        } else {
            msg = "Better Luck next time\n The correct answer for that was" + user["session"]["last_answer"] + "\n"
        }
        return msg + get_trivia_q(db, phone_number)
    } else if (status == "starting") {
        // show scoreboard
        return scoreboard(db, phone_number)
    } else if (status == "done") {
        // show scoreboard
        return scoreboard(db, phone_number)
    } else if (status == "none") {
        if (res == "start?") {
            return start_trivia(db, phone_number)
        } else {
            // show scoreboard
            return scoreboard(db, phone_number)
        }
    } 
}
function show_difficulty() {
    const difficulties = ["easy", "medium", "hard"]
    var difficulty_string = "Pick your difficulty!!!\n"
    var index = 1
    for (difficulty in difficulties) {
        difficulty_string += str(index) + " - " +  str(difficulty) + "\n"
    }
    difficulty_string += "Reply the number next to the difficulty you want or 0 for a mixture of all difficulties"
    return difficulty_string
}

function get_category(db, phone_number, category_num) {
    const list_categories = [
        "General Knowledge",
        "Science & Nature",
        "Mythology",
        "Sports",
        "Geography",
        "History",
        "Animals",
        "Vehicles",
    ]
    const categories = {
        "General Knowledge": 9,
        "Science & Nature": 17,
        "Mythology": 20,
        "Sports": 21,
        "Geography": 22,
        "History": 23,
        "Animals": 27,
        "Vehicles": 28,
    }
    category = list_categories.findIndex(category_num)
    return categories[category]
}

function show_categories() {
    const categories = [
        "General Knowledge",
        "Science & Nature",
        "Mythology",
        "Sports",
        "Geography",
        "History",
        "Animals",
        "Vehicles",
    ]
    var category_string = "Pick your category!!!\n"
    var index = 1
    for (category in categories) {
        category_string += str(index) + " - " +  str(category) + "\n"
    }
    category_string += "Reply the number next to the category you want or 0 for all categories"
    return category_string
}

async function get_trivia_q(db, phone_number, user) {
    next_q = user["next_question"]
    // set new next q
    if (next_q == "" || next_q == null) {
        return current_score(db, phone_number, user)
    }
    return next_q
}

function check_trivia_answer(user, user_answer) {
    const answer = user["last_answer"]
    if (user_answer.toLowerCase() != answer.toLowerCase()) {
        return True
    }
    return False
}

async function get_trivia_info(db, phone_number, num_questions) {
    const data = {
        session: {
            current_score: 0,
            num_questions: num_questions
        }
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

async function create_user(db, phone_number) {
    const data = {
        profile: {
            total_score: 0,
            status: ""
        }
    }
    await db.collection('trivia').doc(phone_number).set(data);
}

function current_score(user) {
    const score = user["current_score"]
    return "You currently have a score of " + str(score) + "\n"
}

function scoreboard(user) {
    const score = user["total_score"]
    return "You currently have a total score of " + str(score) + "\n"
}
