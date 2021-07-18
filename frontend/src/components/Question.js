import React, { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'

// stylesheets
import './Question.css';

export default function Question({ question, correct, answers, fetchNewData }) {
    const [message, setMessage] = useState("");
    const checkAnswer = (e) => {
        if (e.target.innerText === correct) {
            setMessage("✔️")
        } else {
            setMessage("❌")
        }
        setTimeout(() => {
            // your code to be executed after 1 second
            fetchNewData()
        }, 1000);
        setTimeout(() => {
            // your code to be executed after 1 second
            setMessage("❔")
        }, 1700);
    }

    if (answers.length > 2) {
        return (
            <Container className="d-grid gap-5" id="question-container">
                <Row className="justify-content-md-center">
                    <Card body>{ question ? question : "Fetching data..." }</Card>
                </Row>
                <Row className="justify-content-md-center">
                    <Alert id="message" variant="primary">
                        {message ? message : "❔" }
                    </Alert>
                </Row>
                <Row className="justify-content-md-center">
                    <Col>
                        <Button variant="primary" size="lg" className="customized-btns" onClick={checkAnswer}>{correct}</Button>
                    </Col>
                    <Col>
                        <Button variant="primary" size="lg" className="customized-btns" onClick={checkAnswer}>{answers[0]}</Button>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col>
                        <Button variant="primary" size="lg" className="customized-btns" onClick={checkAnswer}>{answers[1]}</Button>
                    </Col>
                    <Col>
                        <Button variant="primary" size="lg" className="customized-btns" onClick={checkAnswer}>{answers[2]}</Button>
                    </Col>
                </Row>
            </Container>
        )
    } else {
        return (
            <Container className="d-grid gap-5" id="question-container">
                <Row className="justify-content-md-center">
                    <Card body>{ question ? question : "Fetching data..." }</Card>
                </Row>
                <Row className="justify-content-md-center">
                    <Alert id="message" variant="primary">
                        {message ? message : "❔" }
                    </Alert>
                </Row>
                <Row className="justify-content-md-center">
                    <Col>
                        <Button variant="primary" size="lg" className="customized-btns" onClick={checkAnswer}>{correct}</Button>
                    </Col>
                    <Col>
                        <Button variant="primary" size="lg" className="customized-btns" onClick={checkAnswer}>{answers[0]}</Button>
                    </Col>
                </Row>
            </Container>
        )
    }
}
