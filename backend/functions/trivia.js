/* statuses: 
    - "" - new account (ask if want to play trivia)
    - "start" - want to start trivia (ask for options - number of qs)
    - "difficulty" - want to start trivia (ask for options - difficulty)
    - "category" - want to start trivia (ask for options - category)
    - "trivia_time" - in the process of trivia (check answer + get next q - if done, get score of current round)
    - "" - done with trivia (view total score)
*/
async function check_status(db, phone_number, user_input) {
    const user = db.collection("trivia")
        .doc(phone_number)
        .get()
    if (!user.exists) {
        // create document
        create_user(db, phone_number)
        welcomemsg = "Welcome to TrivUs!!! We are very excited to have you on board! Do you want to play trivia?"
        return welcomemsg
    }
    const status = user.data["status"]
    if (status == "") {
        if (user_input == "1") {
            set_status(db, phone_number, "start")
            return show_question_number()
        } else {
            return "See you next time"
        }
    } else if (status == "start") {
        // if user input 1-50, ask category, else reask
        var msg = ""
        try {
            user_input = int(user_input)
            if (user_input > 0 && user_input <= 50) {
                start_session(db, phone_number, user_input)
                set_status(db, phone_number, "category")
                return show_categories()
            }
        } catch {
            msg += "Invalid number of questions.\n"
        }
        return msg + show_question_number()
    } else if (status == "category") {
        // if user input between 1-3, ask difficulty
        msg = ""
        try {
            user_input = int(user_input)
            if (user_input > 0 && user_input <= 8) {
                set_category(db, phone_number, user_input)
                set_status(db, phone_number, "difficulty")
                return show_difficulty()
            }
        } catch {
            msg += "Invalid number of questions.\n"
        }
        return msg + show_categories()
    } else if (status == "difficulty") {
        // if user input between 1 and 3, start trivia session
        msg = ""
        try {
            user_input = int(user_input)
            if (user_input > 0 && user_input <= 3) {
                set_difficulty(db, phone_number, user_input)
                set_status(db, phone_number, "trivia_time")
                return show_questions()
            }
        } catch {
            msg += "Invalid difficulty.\n"
        }
        return msg + show_difficulty()
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
        if (user_input == "start?") {
            return start_trivia(db, phone_number)
        } else {
            // show scoreboard
            return scoreboard(db, phone_number)
        }
    } 
}

function set_status(db, phone_number, status) {
    data = {
        status: status
    }
    // change status to "start"
    db.collection("trivia")
        .doc(phone_number)
        .doc(profile)
        .set(data)
}
function start_session(db, phone_number, num_questions) {
    const data = {
        session: {
            current_score: 0,
            num_questions: num_questions,
            quiz_index: 0
        }
    }
    const res = await db.collection('trivia').doc(phone_number).set(data);

function set_category(db, phone_number, category) {
    data = {
        category: get_category(category)
    }
    // change status to "start"
    db.collection("trivia")
        .doc(phone_number)
        .doc(session)
        .set(data)
}

function set_difficulty(db, phone_number, difficulty) {
    data = {
        difficulty: difficulty
    }
    // change status to "start"
    db.collection("trivia")
        .doc(phone_number)
        .doc(session)
        .set(data)
}

function show_question_number() {
    return "Great! Lets Play Trivia!\n How many trivia questions would you like (1-50)?"
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

function get_category(category_num) {
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
    next_q = user["session"]["quiz_index"]
    try {
        question = user["session"]["quiz_questions"][next_q]
    } catch {
        // Out of Questions
        set_status(db, phone_number, "")
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
