const fetch = require("node-fetch");

const fetchOpenTrivia = () => {
    fetch("https://opentdb.com/api.php?amount=10")
    .then((response) => {
        response.json().then((data) => {
            console.log(data)
            return data.results;
        })
    })
}

fetchOpenTrivia()