import { FormEventHandler, useEffect, useState } from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getCompanies, userInfo, getDepartments, getEmployees } from './api/odoo'
import { EmployeeCard } from './components/employeeCard'
import './App.css'
import { UserInfo } from './interfaces/odoo'
import { addScore, getScoreBoard, clearScoreBoard } from './api/scoreStorage' // Import addScore
import { Score, ScoreBoard } from './interfaces/score' // Import Score interface

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}

function Home() {
  const [gameParams, setGameParams] = useState({ companyId: 0, departmentId: 0, inProgress: false })
  const [scoreBoard, setScoreBoard] = useState<ScoreBoard | null>(null)

  const startGame = (e: any) => {
    e.preventDefault()
    setGameParams({
      companyId: parseInt(e.target.company.value),
      departmentId: parseInt(e.target.department.value),
      inProgress: true,
    })
  }

  const resetGame = () => {
    setGameParams({ companyId: 0, departmentId: 0, inProgress: false })
  }

  const { isPending, isError, data } = useQuery({ queryKey: ['user_info'], queryFn: userInfo, retry: false })
  const scoreBoardQuery = useQuery({ queryKey: ['scoreBoard', gameParams.inProgress], queryFn: getScoreBoard })

  useEffect(() => {
    if (scoreBoardQuery.data) {
      setScoreBoard(scoreBoardQuery.data)
    }
  }, [scoreBoardQuery.data])

  const clearScore = () => {
    clearScoreBoard()
    setScoreBoard(null)
  }

  if (isPending || scoreBoardQuery.isPending) return <div>Loading...</div>
  if (isError) return (
    <div className="h-full flex flex-col items-center justify-center gap-8">
      <div>You must be logged into Odoo to play this game.</div>
      <a href="https://www.odoo.com/web/login" className="bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded" target='_blank'>Login to Odoo</a>
    </div>
  )
  if (data) {
    if (gameParams.companyId && gameParams.departmentId) {
      return <Game companyId={gameParams.companyId} departmentId={gameParams.departmentId} resetCb={resetGame} />
    } else {
      return (
        <div className="flex flex-col p-3 justify-between h-screen gap-5">
          <h1 className="text-4xl font-bold text-center pb-3">Employee Quest</h1>
          <div>
            <p className="text-center">Hello {data.name}</p>
            <p className="text-center">Ready to get to know your colleagues better?</p>
            <img src='logo.png' alt="logo" className="mx-auto h-28" />
          </div>
          <div className="text-center">
            <p>Average Score: <b>{scoreBoard?.average.toFixed(1) || 0.0}</b> over {scoreBoard?.num_scores || 0 } games <button className="text-xs text-secondary/75" onClick={clearScore}>Reset</button></p>
          </div>
          <StartForm user={data} startCallback={startGame} />
        </div>
      )
    }
  }
}

interface StartFormProps {
  user: UserInfo,
  startCallback: FormEventHandler,
}

function StartForm({ user, startCallback }: StartFormProps) {
  const companiesQuery = useQuery({ queryKey: ['companies'], queryFn: getCompanies })
  const departmentsQuery = useQuery({ queryKey: ['departments'], queryFn: getDepartments })
  if (companiesQuery.isPending || departmentsQuery.isPending) return <div className="container mx-auto">Loading HR info...</div>
  if (companiesQuery.isError) return <div>Error fetching companies: {companiesQuery.error.message}</div>
  if (departmentsQuery.isError) return <div>Error fetching departments: {departmentsQuery.error.message}</div>

  return (
    <div className="container mx-auto">
      <form onSubmit={startCallback} className="flex flex-col gap-4">
        <div className="mb-4">
          <label htmlFor="company" className="block font-medium">Choose a company:</label>
          <select id="company" className="border border-gray-300 rounded-md p-2 w-full" defaultValue={user.companyId}>
            {companiesQuery.data.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="department" className="block font-medium">Choose a department:</label>
          <select id="department" className="border border-gray-300 rounded-md p-2 w-full" defaultValue={user.departmendId}>
            {departmentsQuery.data.map(department => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">Let's go</button>
      </form>
    </div>
  )
}

function Game({ companyId, departmentId, resetCb }: { companyId: number, departmentId: number, resetCb?: () => void }) {
  interface Questions {
    [key: string]: string;
  }

  interface AllData {
    [key: string]: string[];
    name: string[];
    title: string[];
  }

  const employeesQuery = useQuery({ queryKey: ['employees', companyId, departmentId], queryFn: getEmployees })
  const [currentEmployeeIdx, setCurrentEmployeeIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const allData: AllData = { 'name': [], 'title': [] }

  useEffect(() => {
    if (employeesQuery.data && currentEmployeeIdx >= employeesQuery.data.length) {
      setGameOver(true);
    }
  }, [currentEmployeeIdx, employeesQuery.data])

  const generateQuestion = () => {
    if (!employeesQuery.data) return { question: '', choices: [], answerIdx: 0 }
    const questions: Questions = {
      'name': 'Who is this?',
      //'title': 'What is their job title?',
    }
    allData['name'] = employeesQuery.data.map(employee => employee.name)
    allData['title'] = employeesQuery.data.map(employee => employee.jobTitle)
    const randomIdx = Math.floor(Math.random() * Object.keys(questions).length)
    const questionType = Object.keys(questions)[randomIdx]
    const questionText = questions[questionType]
    // extract 3 random choices and add the correct answer
    const choices = []
    const correctAnswer = allData[questionType][currentEmployeeIdx]
    choices.push(correctAnswer)
    while (choices.length < 4) {
      const randomChoice = allData[questionType][Math.floor(Math.random() * allData[questionType].length)]
      if (!choices.includes(randomChoice)) {
        choices.push(randomChoice)
      }
    }
    // shuffle the choices
    choices.sort(() => Math.random() - 0.5)
    return { question: questionText, choices, answerIdx: choices.indexOf(correctAnswer) }
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (isCorrect) setScore(score + 1);
    setCurrentEmployeeIdx(currentEmployeeIdx + 1);
    if (employeesQuery.data && currentEmployeeIdx >= employeesQuery.data.length - 1) {
      setGameOver(true);
      await saveFinalScore(score + (isCorrect ? 1 : 0));
    }
  };

  const handleSkip = () => {
    setCurrentEmployeeIdx(currentEmployeeIdx + 1);
    if (employeesQuery.data && currentEmployeeIdx >= employeesQuery.data.length - 1) {
      setGameOver(true);
      saveFinalScore(score);
    }
  }

  const saveFinalScore = async (score: number) => {
    const newScore: Score = {
      score: score,
      date: new Date().toISOString(),
      description: JSON.stringify({company: companyId, department: departmentId }),
    }
    try {
      await addScore(newScore)
      console.log('Score saved successfully.')
    } catch (error) {
      console.error('Error saving score:', error)
    }
  }

  const getScoreBgColor = () => {
    if (score === 0) return 'bg-red-500';
    if (score === employeesQuery.data?.length) return 'bg-green-500';
    if (score < (employeesQuery.data?.length ?? 0) / 2) return 'bg-red-200';
    if (score >= (employeesQuery.data?.length ?? 0) / 2) return 'bg-green-200';
    return 'bg-gray-200';
  }

  if (employeesQuery.isPending) return <div>Loading employees...</div>
  if (employeesQuery.isError) return <div>Error fetching employees: {employeesQuery.error.message}</div>

  if (gameOver) {
    return (
      <div className="container mx-auto">
        <h1 className="text-xl font-bold text-center py-3">Your score</h1>
        <div className={`aspect-square rounded-full text-9xl ${getScoreBgColor()} flex items-center justify-center m-8`}>
          <div className="diagonal-fractions">
            {score}/{employeesQuery.data.length}
          </div>
        </div>
        <h3 className="text-center pb-2 text-2xl">This game's colleagues:</h3>
        <div className="flex flex-col">
          {employeesQuery.data.map(employee => (
            <div key={employee.id} className="flex flex-row items-center gap-4 p-2 rounded border border-gray-200 m-2">
              <img src={employee.avatarUrl} alt={employee.name} className="w-12 h-12 rounded-full aspect-square object-cover" />
              <div>
                <p className="font-bold">{employee.name}</p>
                <p>{employee.jobTitle}</p>
                <p>{employee.departmentName}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="m-2">
          <button onClick={resetCb} className="bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded w-full">Play again</button>
        </div>
      </div>
    )
  }

  const { question, choices, answerIdx } = generateQuestion()

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold text-center pb-3">Employee Quest</h1>
      <EmployeeCard
        key={employeesQuery.data[currentEmployeeIdx].id}
        employee={employeesQuery.data[currentEmployeeIdx]}
        question={question}
        choices={choices}
        answerIdx={answerIdx}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
      />
    </div>
  )
}
export default App
