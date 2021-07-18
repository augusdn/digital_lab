const axios = require('axios');

async function fetchQuestions(n = 10, cat = "", diff = "") {
    var url = "https://opentdb.com/api.php?";
    const categories = [9, 17, 20, 21, 22, 23, 27, 28];
    const difficulty = ["easy", "medium", "hard"];

    if (0 > n && n > 50) n = 10;
    if (0 >= cat && cat > 9) cat = "";
    if ((diff != 1) && (diff != 2) && (diff != 3)) diff = "";

    url += "amount=" + n;
    if (cat) {
        // console.log(cat);
        url += "&category=" + categories[cat];
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

// fetchQuestions(20, 1, 2);
module.exports = { fetchQuestions };