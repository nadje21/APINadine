'use client'

import { useState, useEffect } from 'react'

interface ExerciseData {
  formula_type: 'energie' | 'vermogen' | 'weerstand'
  question_text: string
  given_values: Record<string, { value: number; unit: string }>
  asked_variable: string
  correct_answer: number
  correct_unit: string
  difficulty: string
}

interface Evaluation {
  is_correct: boolean
  gegeven_correct: boolean
  gevraagd_correct: boolean
  berekening_correct: boolean
  antwoord_correct: boolean
  feedback: string
  tips?: string
}

type Step = 'setup' | 'gegeven' | 'gevraagd' | 'berekening' | 'antwoord' | 'feedback'

export default function NatuurkundeOefenApp() {
  const [userName, setUserName] = useState('')
  const [formulaType, setFormulaType] = useState<'energie' | 'vermogen' | 'weerstand'>('energie')
  const [difficulty, setDifficulty] = useState<'makkelijk' | 'gemiddeld' | 'moeilijk'>('gemiddeld')
  const [currentStep, setCurrentStep] = useState<Step>('setup')
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [givenStep, setGivenStep] = useState('')
  const [askedStep, setAskedStep] = useState('')
  const [calculationStep, setCalculationStep] = useState('')
  const [finalAnswer, setFinalAnswer] = useState('')

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    const savedName = localStorage.getItem('natuurkunde_username')
    if (savedName) {
      setUserName(savedName)
    }
    const savedScore = localStorage.getItem('natuurkunde_score')
    if (savedScore) {
      setScore(JSON.parse(savedScore))
    }
  }, [])

  const saveName = () => {
    if (userName.trim()) {
      localStorage.setItem('natuurkunde_username', userName.trim())
    }
  }

  const generateExercise = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula_type: formulaType, difficulty })
      })

      if (!response.ok) throw new Error('Fout bij genereren opgave')

      const data = await response.json()
      setExercise(data.exercise)
      setCurrentStep('gegeven')
      resetAnswers()
    } catch (error) {
      console.error('Error:', error)
      alert('Fout bij het genereren van een opgave. Probeer opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetAnswers = () => {
    setGivenStep('')
    setAskedStep('')
    setCalculationStep('')
    setFinalAnswer('')
    setEvaluation(null)
  }

  const handleStepComplete = (step: Step) => {
    if (step === 'gegeven' && givenStep.trim().length < 5) {
      alert('Vul alle gegeven waarden in met hun eenheden!')
      return
    }
    if (step === 'gevraagd' && askedStep.trim().length < 3) {
      alert('Vul in wat er gevraagd wordt!')
      return
    }
    if (step === 'berekening' && calculationStep.trim().length < 5) {
      alert('Vul je berekening in met de juiste formule!')
      return
    }
    if (step === 'antwoord' && finalAnswer.trim().length < 1) {
      alert('Vul je eindantwoord in!')
      return
    }

    const stepOrder: Step[] = ['gegeven', 'gevraagd', 'berekening', 'antwoord', 'feedback']
    const currentIndex = stepOrder.indexOf(step)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const submitAnswer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise,
          given_step: givenStep,
          asked_step: askedStep,
          calculation_step: calculationStep,
          final_answer: finalAnswer
        })
      })

      if (!response.ok) throw new Error('Fout bij controleren antwoord')

      const data = await response.json()
      setEvaluation(data.evaluation)
      setCurrentStep('feedback')

      const newScore = {
        correct: score.correct + (data.evaluation.is_correct ? 1 : 0),
        total: score.total + 1
      }
      setScore(newScore)
      localStorage.setItem('natuurkunde_score', JSON.stringify(newScore))
    } catch (error) {
      console.error('Error:', error)
      alert('Fout bij het controleren. Probeer opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const startNewExercise = () => {
    setCurrentStep('setup')
    setExercise(null)
    resetAnswers()
  }

  const formulaInfo = {
    energie: {
      name: 'Energie (E = P × t)',
      icon: '🔋',
      color: 'blue',
      description: 'Bereken hoeveel energie een apparaat verbruikt'
    },
    vermogen: {
      name: 'Vermogen (P = U × I)',
      icon: '⚡',
      color: 'green',
      description: 'Bereken het vermogen van een apparaat'
    },
    weerstand: {
      name: 'Weerstand (R = U / I)',
      icon: '🔌',
      color: 'yellow',
      description: 'Bereken de weerstand in een circuit'
    }
  }

  if (currentStep === 'setup') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!userName ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welkom!</h2>
              <p className="text-gray-600 mb-4">Wat is je naam?</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveName()}
                  placeholder="Vul je naam in..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveName}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Hoi {userName}! 👋
                </h2>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Score</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {score.correct} / {score.total}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Kies een formule type:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(formulaInfo).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setFormulaType(key as any)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formulaType === key
                          ? `border-${info.color}-500 bg-${info.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{info.icon}</div>
                      <div className="font-bold text-gray-800 text-sm mb-1">
                        {info.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {info.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Kies moeilijkheidsgraad:
                </h3>
                <div className="flex gap-3">
                  {['makkelijk', 'gemiddeld', 'moeilijk'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level as any)}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        difficulty === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {level === 'makkelijk' && '😊 '}
                      {level === 'gemiddeld' && '🤔 '}
                      {level === 'moeilijk' && '🎓 '}
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateExercise}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Opgave maken...' : '🚀 Start Opgave'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!exercise) return null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
            <p className="text-sm text-gray-500">
              {formulaInfo[formulaType].name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {score.correct} / {score.total}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <h3 className="font-bold text-blue-900 mb-2">Opgave:</h3>
          <p className="text-blue-800 text-lg">{exercise.question_text}</p>
        </div>

        <div className="space-y-6">
          <div className={`p-5 rounded-lg border-2 ${
            currentStep === 'gegeven'
              ? 'border-blue-500 bg-blue-50'
              : givenStep
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  givenStep ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  1
                </span>
                Gegeven
              </h3>
              {givenStep && currentStep !== 'gegeven' && (
                <span className="text-green-600 font-bold">✓</span>
              )}
            </div>
            {currentStep === 'gegeven' && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Schrijf alle gegeven waarden op met hun eenheden. Bijvoorbeeld: P = 60 W, t = 120 s
                </p>
                <textarea
                  value={givenStep}
                  onChange={(e) => setGivenStep(e.target.value)}
                  placeholder="P = ... W&#10;t = ... s"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={4}
                />
                <button
                  onClick={() => handleStepComplete('gegeven')}
                  className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Volgende Stap →
                </button>
              </>
            )}
            {givenStep && currentStep !== 'gegeven' && (
              <pre className="bg-white p-3 rounded border border-gray-200 font-mono text-sm whitespace-pre-wrap">
{givenStep}
              </pre>
            )}
          </div>

          <div className={`p-5 rounded-lg border-2 ${
            currentStep === 'gevraagd'
              ? 'border-blue-500 bg-blue-50'
              : askedStep
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-gray-50 opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  askedStep ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  2
                </span>
                Gevraagd
              </h3>
              {askedStep && currentStep !== 'gevraagd' && (
                <span className="text-green-600 font-bold">✓</span>
              )}
            </div>
            {currentStep === 'gevraagd' && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Schrijf op wat er gevraagd wordt. Bijvoorbeeld: E = ?
                </p>
                <input
                  type="text"
                  value={askedStep}
                  onChange={(e) => setAskedStep(e.target.value)}
                  placeholder="E = ?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  onClick={() => handleStepComplete('gevraagd')}
                  className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Volgende Stap →
                </button>
              </>
            )}
            {askedStep && currentStep !== 'gevraagd' && (
              <pre className="bg-white p-3 rounded border border-gray-200 font-mono text-sm">
{askedStep}
              </pre>
            )}
          </div>

          <div className={`p-5 rounded-lg border-2 ${
            currentStep === 'berekening'
              ? 'border-blue-500 bg-blue-50'
              : calculationStep
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-gray-50 opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  calculationStep ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  3
                </span>
                Berekening
              </h3>
              {calculationStep && currentStep !== 'berekening' && (
                <span className="text-green-600 font-bold">✓</span>
              )}
            </div>
            {currentStep === 'berekening' && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Schrijf de formule op en werk deze stap voor stap uit. Bijvoorbeeld:
                  E = P × t<br />
                  E = 60 × 120<br />
                  E = 7200 J
                </p>
                <textarea
                  value={calculationStep}
                  onChange={(e) => setCalculationStep(e.target.value)}
                  placeholder="Formule:&#10;E = P × t&#10;&#10;Invullen:&#10;E = ... × ...&#10;&#10;Uitwerken:&#10;E = ..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={8}
                />
                <button
                  onClick={() => handleStepComplete('berekening')}
                  className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Volgende Stap →
                </button>
              </>
            )}
            {calculationStep && currentStep !== 'berekening' && (
              <pre className="bg-white p-3 rounded border border-gray-200 font-mono text-sm whitespace-pre-wrap">
{calculationStep}
              </pre>
            )}
          </div>

          <div className={`p-5 rounded-lg border-2 ${
            currentStep === 'antwoord'
              ? 'border-blue-500 bg-blue-50'
              : finalAnswer
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-gray-50 opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  finalAnswer ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  4
                </span>
                Antwoord
              </h3>
              {finalAnswer && currentStep !== 'antwoord' && (
                <span className="text-green-600 font-bold">✓</span>
              )}
            </div>
            {currentStep === 'antwoord' && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Geef je eindantwoord met de juiste eenheid. Bijvoorbeeld: E = 7200 J
                </p>
                <input
                  type="text"
                  value={finalAnswer}
                  onChange={(e) => setFinalAnswer(e.target.value)}
                  placeholder="E = ... J"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                />
                <button
                  onClick={submitAnswer}
                  disabled={isLoading}
                  className="mt-3 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Nakijken...' : '✓ Controleer Antwoord'}
                </button>
              </>
            )}
            {finalAnswer && currentStep !== 'antwoord' && (
              <pre className="bg-white p-3 rounded border border-gray-200 font-mono text-lg">
{finalAnswer}
              </pre>
            )}
          </div>

          {currentStep === 'feedback' && evaluation && (
            <div className={`p-6 rounded-lg border-2 ${
              evaluation.is_correct
                ? 'border-green-500 bg-green-50'
                : 'border-orange-500 bg-orange-50'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  evaluation.is_correct ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  <span className="text-white text-2xl">
                    {evaluation.is_correct ? '✓' : '!'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {evaluation.is_correct ? 'Goed gedaan!' : 'Bijna goed!'}
                </h3>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center">
                  <span className={`mr-3 ${evaluation.gegeven_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {evaluation.gegeven_correct ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-700">Gegeven</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-3 ${evaluation.gevraagd_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {evaluation.gevraagd_correct ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-700">Gevraagd</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-3 ${evaluation.berekening_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {evaluation.berekening_correct ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-700">Berekening</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-3 ${evaluation.antwoord_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {evaluation.antwoord_correct ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-700">Antwoord</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">{evaluation.feedback}</p>
              </div>

              {evaluation.tips && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Tips:</p>
                  <p className="text-blue-800 text-sm">{evaluation.tips}</p>
                </div>
              )}

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Correcte antwoord:</p>
                <p className="text-gray-800 font-mono text-lg">
                  {exercise.asked_variable} = {exercise.correct_answer} {exercise.correct_unit}
                </p>
              </div>

              <button
                onClick={startNewExercise}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
              >
                Volgende Opgave →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
