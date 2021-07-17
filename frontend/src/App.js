import { useState, useEffect } from 'react';

// our own components
import Navbar from './components/Navigationbar';
import Question from './components/Question';

// stylesheets
// import './App.css';

const cleanUpArray = (questions) => {
    var copy = questions.slice(0);
    copy.map((a) => {
        a = a.replace(/&quot;/g, "\"")
        a = a.replace(/&#039;/g, "\'")
        a = a.replace(/&Omicron;/g, "Ο")
        a = a.replace(/&Pi;/g, "π")
        a = a.replace(/&Sigma;/g, "Σ")
        a = a.replace(/&Sigma;/g, "Ν")
    })
    return copy
}

const cleanUpString = (question) => {
    question = question.replace(/&quot;/g, "\"")
    question = question.replace(/&#039;/g, "\'")
    question = question.replace(/&Omicron;/g, "Ο")
    question = question.replace(/&Pi;/g, "π")
    question = question.replace(/&Sigma;/g, "Σ")
    question = question.replace(/&Sigma;/g, "Ν")
    return question
}

function App() {
    const [openTrivia, setOpenTrivia] = useState("");
    const [correct, setCorrect] = useState("");
    const [answers, setAnswers] = useState([]);

    // fetch data from open trivia
    const fetchOpenTrivia = () => {
        fetch("https://opentdb.com/api.php?amount=1")
        .then((response) => {
            // console.log("fetching data...")
            response.json().then((data) => {
                data.results.map((q) => {
                    setOpenTrivia(cleanUpString(q.question))
                    setCorrect(cleanUpString(q.correct_answer))
                    setAnswers(cleanUpArray(q.incorrect_answers))
                })
            })
        })
    }

    useEffect(() => {
        fetchOpenTrivia()
    }, [])

    return (
        <div className="App">
            {/* <header className="App-header">
            <h1>Sign up for TrivUs</h1>
            </header> */}
            <Navbar />
            <Question question={openTrivia} correct={correct} answers={answers} fetchNewData={fetchOpenTrivia}/>
        </div>
    );
}

export default App;
