import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API configuratie ontbreekt' },
        { status: 500 }
      )
    }

    const {
      exercise,
      given_step,
      asked_step,
      calculation_step,
      final_answer
    } = await request.json()

    if (!exercise || !given_step || !asked_step || !calculation_step || !final_answer) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const formulas = {
      energie: 'E = P × t',
      vermogen: 'P = U × I',
      weerstand: 'R = U / I'
    }

    const prompt = `Je bent een natuurkunde docent die het werk van een leerling nakijkt.

OPGAVE:
${exercise.question_text}

GEGEVEN WAARDEN (correct):
${Object.entries(exercise.given_values).map(([key, val]: [string, any]) =>
  `${key} = ${val.value} ${val.unit}`
).join('\n')}

GEVRAAGD (correct):
${exercise.asked_variable}

CORRECTE FORMULE:
${formulas[exercise.formula_type as keyof typeof formulas]}

CORRECT ANTWOORD:
${exercise.correct_answer} ${exercise.correct_unit}

---

ANTWOORD VAN LEERLING:

Gegeven:
${given_step}

Gevraagd:
${asked_step}

Berekening:
${calculation_step}

Antwoord:
${final_answer}

---

Beoordeel het werk van de leerling volgens deze criteria:

1. GEGEVEN: Heeft de leerling alle gegeven waarden correct opgeschreven met eenheden?
2. GEVRAAGD: Heeft de leerling correct aangegeven wat gevraagd wordt?
3. BEREKENING: Is de formule correct toegepast? Zijn de stappen duidelijk?
4. ANTWOORD: Is het eindantwoord correct (met juiste eenheid)?

Geef constructieve feedback in een vriendelijke toon. Als iets fout is, leg uit wat beter kan.

Geef je beoordeling in dit EXACTE JSON formaat:
{
  "is_correct": true/false,
  "gegeven_correct": true/false,
  "gevraagd_correct": true/false,
  "berekening_correct": true/false,
  "antwoord_correct": true/false,
  "feedback": "Goed gedaan! Je hebt...",
  "tips": "Let volgende keer op..."
}

Geef ALLEEN de JSON, geen extra tekst.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Geen geldige JSON ontvangen van AI')
    }

    const evaluation = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      evaluation
    })

  } catch (error) {
    console.error('Error checking answer:', error)
    return NextResponse.json(
      { error: 'Fout bij het controleren van antwoord' },
      { status: 500 }
    )
  }
}
