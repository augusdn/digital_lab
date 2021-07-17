const axios = require('axios');

async function fetchQuestions(n = 10, cat = 0, diff = "easy") {
    var url = "https://opentdb.com/api.php?";

    if (0 > n && n > 50) n = 10;
    if (0 > cat && cat > 9) cat = 0;
    if ((diff != "easy") && (diff != "medium") && (diff != "hard")) diff = "easy";

    url = url + "amount=" + n + "&category=" + cat + "&difficulty=" + diff;

    console.log(url);

    const config = {
        method: 'get',
        url: url
    }

    let res = await axios(config)

    console.log(res.status);
    console.log(res.data);
}

// fetchQuestions();
module.exports = { fetchQuestions };