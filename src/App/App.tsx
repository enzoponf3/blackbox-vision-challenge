import * as React from "react"

import Loader from "../components/loader/Loader"

import styles from "./App.module.scss"
import {Question} from "./types"
import api from "./api"

const App: React.FC = () => {
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = React.useState<number>(0)
  const [mode, setMode] = React.useState<"classic" | "endless" | "" | "done">("")
  const [status, setStatus] = React.useState<"pending" | "resolved" | "finished">("pending")
  const [score, setScore] = React.useState<number>(0)
  const question = questions[currentQuestion]

  const normalMode = () => {
    setMode("classic")
  }

  const endlessMode = () => {
    setMode("endless")
  }

  React.useEffect(() => {
    api.list().then((res) => {
      setQuestions(res)
      setStatus("resolved")
    })
  }, [])

  const handleSelect = (election: string, e: HTMLButtonElement) => {
    if (election === question.correct_answer) {
      e.classList.toggle(styles.correct)
      if (mode === "classic") {
        const newScore = question.type === "boolean" ? score + 5 : score + 10

        setScore(newScore)
      } else {
        setScore(score + 1)
      }
    } else {
      e.classList.toggle(styles.incorrect)
      setTimeout(() => {
        if (mode === "endless") {
          setStatus("finished")
        }
      }, 1000)
    }
    setTimeout(async () => {
      if (currentQuestion === questions.length - 1) {
        if (mode === "endless") {
          await api.list().then((res) => {
            setQuestions(res)
            setCurrentQuestion(0)
          })

          return
        } else {
          setStatus("finished")
        }
      }
      setCurrentQuestion(currentQuestion + 1)
    }, 1000)
  }

  const handleReplay = () => {
    setScore(0)
    setCurrentQuestion(0)
    api.list().then((res) => {
      setQuestions(res)
      setStatus("resolved")
    })
    setMode("")
  }

  if (mode === "") {
    return (
      <div className={styles.container}>
        <h2>Welcome!</h2>
        <p>Please select a mode.</p>
        <div className={styles.startButtons}>
          <button onClick={normalMode}>Normal</button>
          <button onClick={endlessMode}>Endeless</button>
        </div>
        <div className={styles.help}>
          <p className={styles.helpIcon}>i</p>
          <div className={styles.helpDescription}>
            <section>
              <p>
                {" "}
                <strong>Normal:</strong> Answer 10 questions.
              </p>

              <p>Multiple choice adds 10 points!</p>
              <p>True/false adds 5 points!</p>
            </section>
            <section>
              <p>
                <strong>Endless: </strong>Answer correctly to continue scoring points.
              </p>
              <p>1 point for correct answer!</p>
              <p>Fail and it´s all over!</p>
            </section>
          </div>
        </div>
      </div>
    )
  }
  if (status === "pending") {
    return <Loader />
  }
  if (status === "finished") {
    return (
      <div className={styles.container}>
        <p>Your score is {score}</p>
        <button onClick={handleReplay}>Play Again!</button>
      </div>
    )
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h3>{mode}</h3>
      </header>

      <div className={styles.questionContainer}>
        <div className={styles.questionNumber}>
          {mode === "classic" ? `${currentQuestion + 1}/${questions.length}` : `${score}`}
        </div>
        <div className={styles.questionBody}>
          <p>{question.question.replace(/&quot;|&#039;/g, "'")}</p>
          <div className={styles.questionFooter}>
            <p>{`${question.category} - ${question.difficulty}`}</p>
          </div>
        </div>
        {[...question.incorrect_answers, question.correct_answer]
          .sort((a, b) => b.localeCompare(a))
          .map((answer) => (
            <button
              key={answer}
              className={styles.questionAnswer}
              onClick={(e) => handleSelect(answer, e.currentTarget)}
            >
              {answer.replace(/&quot;|&#039;/g, "'")}
            </button>
          ))}
      </div>
    </main>
  )
}

export default App
