import { useState } from 'react'

const StatisticLine = ({ text, value }) => {
  return (
    <tr>
      <td>{text}</td>
      <td>{value}{text === "positive" ? "%" : ""}</td>
    </tr>
  )
}

const Statistics = (props) => {
  if (props.all === 0) {
    return (
      <div>
        <h1>statistics</h1>
        <p>No feedback given</p>
      </div>
    )
  }
  return (
    <div>
      <h1>statistics</h1>
      <table>
        <tbody>
          <StatisticLine text="good" value={props.good} />
          <StatisticLine text="neutral" value={props.neutral} />
          <StatisticLine text="bad" value={props.bad} />
          <StatisticLine text="all" value={props.all} />
          <StatisticLine text="average" value={props.sum / props.all} />
          <StatisticLine text="positive" value={props.positive / props.all * 100} />
        </tbody>
      </table>
    </div>
  )
}

const Button = ({ onClick, text }) => (
  <button onClick={onClick}>
    {text}
  </button>
)

const App = () => {
  // tallenna napit omaan tilaansa
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  const [all, setAll] = useState(0)
  const [positive, setPositive] = useState(0)
  const [sum, setSum] = useState(0)

  const addGood = () => {
    setGood(good + 1)
    setAll(all + 1)
    setSum(sum + 1)
    setPositive(positive + 1)
  }
  const addNeutral = () => {
    setNeutral(neutral + 1)
    setAll(all + 1)
    setSum(sum + 0)
  }
  const addBad = () => {
    setBad(bad + 1)
    setAll(all + 1)
    setSum(sum - 1)
  }

  return (
    <div>
      <h1>give feedback</h1>
      <Button onClick={addGood} text='good' />
      <Button onClick={addNeutral} text='neutral' />
      <Button onClick={addBad} text='bad' />
      <Statistics good={good} neutral={neutral} bad={bad} all={all} sum={sum} positive={positive} />
    </div>
  )
}

export default App