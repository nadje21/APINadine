import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface ExerciseData {
  formula_type: 'energie' | 'vermogen' | 'weerstand'
  question_text: string
  given_values: Record<string, { value: number; unit: string }>
  asked_variable: string
  correct_answer: number
  correct_unit: string
  difficulty: 'makkelijk' | 'gemiddeld' | 'moeilijk'
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API configuratie ontbreekt' },
        { status: 500 }
      )
    }

    const { formula_type, difficulty = 'gemiddeld' } = await request.json()

    if (!formula_type || !['energie', 'vermogen', 'weerstand'].includes(formula_type)) {
      return NextResponse.json(
        { error: 'Ongeldig formule type' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    })

    const formulas = {
      energie: 'E = P × t (Energie = Vermogen × tijd)',
      vermogen: 'P = U × I (Vermogen = Spanning × Stroomsterkte)',
      weerstand: 'R = U / I (Weerstand = Spanning / Stroomsterkte)'
    }

    const difficultyDescriptions = {
      makkelijk: 'Gebruik hele getallen en eenvoudige waarden. Bijvoorbeeld: P=100W, t=2s',
      gemiddeld: 'Gebruik realistische waarden met soms kommagetallen. Bijvoorbeeld: P=150W, t=3.5s',
      moeilijk: 'Gebruik complexere waarden en eenheden zoals kW, mA, kOhm die omgerekend moeten worden'
    }

    const prompt = `Genereer een natuurkunde opgave voor HAVO/VWO onderbouw over elektriciteit.

Formule: ${formulas[formula_type as keyof typeof formulas]}
Moeilijkheidsgraad: ${difficulty} - ${difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions]}

Regels:
1. Maak een realistische situatie (lamp, apparaat, circuit, etc.)
2. Geef 2 waarden en vraag naar de 3e
3. Gebruik correcte eenheden:
   - Energie: J (joule), kJ
   - Vermogen: W (watt), kW
   - Spanning: V (volt)
   - Stroomsterkte: A (ampere), mA
   - Weerstand: Ω (ohm), kΩ
   - Tijd: s (seconde), min, h
4. Zorg dat de opgave helder is

Geef je antwoord in dit EXACTE JSON formaat:
{
  "question_text": "Een lamp heeft een...",
  "given_values": {
    "P": {"value": 60, "unit": "W"},
    "t": {"value": 3600, "unit": "s"}
  },
  "asked_variable": "E",
  "correct_answer": 216000,
  "correct_unit": "J"
}

Geef ALLEEN de JSON, geen extra tekst.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log('AI Response:', response)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', response)
      return NextResponse.json(
        { error: 'AI gaf geen geldige JSON terug. Probeer opnieuw.' },
        { status: 500 }
      )
    }

    const exerciseData: ExerciseData = JSON.parse(jsonMatch[0])
    exerciseData.formula_type = formula_type
    exerciseData.difficulty = difficulty

    return NextResponse.json({
      success: true,
      exercise: exerciseData
    })

  } catch (error) {
    console.error('Error generating exercise:', error)
    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout'
    return NextResponse.json(
      {
        error: 'Fout bij het genereren van opgave',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
