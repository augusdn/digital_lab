const fetch = require("node-fetch");

const fetchOpenTrivia = (questions, category, difficulty) => {
    // the base url (default)
    var url = "https://opentdb.com/api.php?amount=5";
    // building url with parameters
    if (questions > 0 && questions <= 50) {
        url = "https://opentdb.com/api.php?amount=" + questions;
    };
    if (category > 0 && category < 9) {
        url = url + "&category=" + getCategory(category);
    };
    if (difficulty === "easy") {
        url = url + "&difficulty" + difficulty;
    } else if (difficulty === "medium") {
        url = url + "&difficulty" + difficulty;
    } else if (difficulty === "hard") {
        url = url + "&difficulty" + difficulty;
    };
    // fetch and return
    fetch(url)
    .then((response) => {
        response.json().then((data) => {
            console.log(data)
            return data.results;
        })
    })
}

