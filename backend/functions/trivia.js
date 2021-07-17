/* statuses: 
    - new account (ask for username)
    - "start" - want to start trivia (ask for options - number of qs)
    - "difficulty" - want to start trivia (ask for options - difficulty)
    - "category" - want to start trivia (ask for options - category)
    - "trivia_time" - in the process of trivia (check answer + get next q - if done, get score of current round)
    - "" - ask if they want to play trivia
*/
async function check_status(db, phone_number, user_input) {
    const user = db.collection("trivia")
        .doc(phone_number)
        .get()
    if (!user.exists) {
        // create document
        create_user(db, phone_number)
        welcomemsg = "Welcome to TrivUs!!! We are very excited to have you on board! What should we call you?"
        return welcomemsg
    }
    const status = user.data["status"]
    if (status == "name") {
        set_username(db, phone_number, user_input)
        set_status(db, phone_number, "")
        return start_trivia(user["username"])
    } else if (status == "") {
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
        return msg + show_question_number(user["username"])
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
                set_quiz_index(db, phone_number, 1)
                return show_questions()
            }
        } catch {
            msg += "Invalid difficulty.\n"
        }
        return msg + show_difficulty()
    } else if (status == "trivia_time") {
        // if no questions in list, add
        if (user["session"]["quiz_questions"].length() == 0) {
            set_trivia_questions(db, phone_number, user)
            return "Cool! Lets get started!\n" + get_trivia_q(db, phone_number, user)
        }
        // else check answers
        if (check_trivia_answer(db, phone_number, user_input)) {
            msg = "Great Job!\n"
        } else {
            msg = "Better Luck next time\n The correct answer for that was" + get_last_answer(user) + "\n"
        }
        return msg + get_trivia_q(db, phone_number, user)
    } else {
        return scoreboard(db, phone_number, user)
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

async function start_session(db, phone_number, num_questions) {
    const data = {
        session: {
            current_score: 0,
            num_questions: num_questions,
            quiz_index: 0,
            quiz_questions: []
        }
    }
    await db.collection('trivia').doc(phone_number).set(data);
}

function set_username(db, phone_number, name) {
    data = {
        username: name
    }
    // change status to "start"
    db.collection("trivia")
        .doc(phone_number)
        .doc(profile)
        .set(data)
}

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

function set_quiz_index(db, phone_number, index) {
    data = {
        quiz_index: index
    }
    // change status to "start"
    db.collection("trivia")
        .doc(phone_number)
        .doc(session)
        .set(data)
}

function set_trivia_questions(db, phone_number, user) {
    difficulty = user["session"]["difficulty"]
    num_qs = user["session"]["num_questions"]
    category = user["session"]["category"]
    questions = fetchOpenTrivia(num_qs, category, difficulty)
    quiz_questions = []
    for (question in questions) {
        const q = question["question"]
        const a = question["correct_answer"]
        var ans = question["incorrect_answers"]
        ans.push(a)
        var ans_list = []
        while (ans.length() > 0) {
            next_index = Math.floor(Math.random() * (ans.length()))
            ans_list.push(ans[next_index])
            ans.pop(next_index)
        }
        answer = ans_list.indexOf(a)
        quiz_questions.push({question: q, answer_index: answer, answer_list: ans_list})
    }
    data = {
        quiz_questions: quiz_questions
    }
    db.collection("trivia")
        .doc(phone_number)
        .doc(session)
        .set(data)
}

function show_trivia(name) {
    return "Hi " + name + "! Do you want to play trivia?"
}

function show_question_number(name) {
    return "Great Choice " + name + "! Lets Play Trivia!\n How many trivia questions would you like (1-50)?"
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
        "All Categories"
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
        "All Categories": "all"
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


function get_trivia_q(db, phone_number, user) {
    next_q = user["session"]["quiz_index"]
    try {
        question = user["session"]["quiz_questions"][next_q]["question"]
        answer_list = user["session"]["quiz_questions"][next_q]["answer_list"]
        answers = ""
        index = 1
        for (answer in answer_list) {
            answers += str(index) + " - " + str(answer) + "\n"
        }
        set_quiz_index(db, phone_number, next_q+1)
        return question + "\n" + answers
    } catch {
        // Out of Questions
        set_status(db, phone_number, "")
        return current_score(db, phone_number, user) + "\n" + scoreboard(db, phone_number, user)
    }
}

function check_trivia_answer(user, user_answer) {
    const answer_index = user["session"]["quiz_index"]
    const answer = user["session"]["quiz_questions"][answer_index]["answer_index"]
    if (int(user_answer)-1 == int(answer)) {
        return True
    }
    return False
}

function get_last_answer(user) {
    last_q = user["session"]["quiz_index"]
    last_q_answer_index = user["session"]["quiz_questions"][last_q]["answer_index"]
    return user["session"]["quiz_questions"][last_q]["answer_list"][last_q_answer_index]
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

function scoreboard(db, phone_number, user) {
    var msg = "Top 10 on TrivTourni"
    const score = user["total_score"]
    const scoreboard = db.collection("trivia")
    .orderBy("profile.total_score")
    var user_in_scoreboard = false
    var position = 1
    var index = 1
    var final_scoreboard = []
    for (score in scoreboard) {
        if (index <= 10) {
            msg += str(index)
            if (index == 1) {
                msg += "st"
            } else if (index == 2) {
                msg += "nd"
            } else if (index == 3) {
                msg += "rd"
            } else {
                msg += "th"
            }
            msg += " - " + score["username"] + "\n"
            if (score["phone_number"] == phone_number) {
                user_in_scoreboard = true
                position = index
            }
        } else if (score["phone_number"] == phone_number) {
            user_in_scoreboard = false
            position = index
        }
        index += 1
    }
    if (user_in_scoreboard) {
        msg += "Congragulations " + user["username"] + "! You have placed " + str(position)
        if (position == 1) {
            msg += "st!!!\n"
        } else if (position == 2) {
            msg += "nd!!!\n"
        } else if (position == 3) {
            msg += "rd!!!\n"
        } else {
            msg += "th!!!\n"
        }
    } else {
        msg += "You are currently coming in " + position 
        const pos = position.toString()[position.toString().length()]
        if (pos == "1") {
            if (position == 11) {
                msg += "th"
            } else {
                msg += "st"
            }
        } else if (pos == "2") {
            if (position == 12) {
                msg += "th"
            } else {
                msg += "nd"
            }
        } else if (pos == "3") {
            if (position == 13) {
                msg += "th"
            } else {
                msg += "rd"
            }
        } else {
            msg += "th"
        }
        msg += " place with a total score of " + str(score) + "\n"
    }
    return msg
}
