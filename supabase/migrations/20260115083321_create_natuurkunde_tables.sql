/*
  # Natuurkunde Oefenapp Database Schema
  
  1. Nieuwe Tabellen
    - `exercises`
      - `id` (uuid, primary key)
      - `formula_type` (text) - 'energie', 'vermogen', of 'weerstand'
      - `question_text` (text) - De opgave tekst
      - `given_values` (jsonb) - Gegeven waarden met eenheden
      - `asked_variable` (text) - Wat gevraagd wordt
      - `correct_answer` (numeric) - Het juiste antwoord
      - `correct_unit` (text) - De juiste eenheid
      - `difficulty` (text) - 'makkelijk', 'gemiddeld', 'moeilijk'
      - `created_at` (timestamptz)
    
    - `user_attempts`
      - `id` (uuid, primary key)
      - `exercise_id` (uuid, foreign key)
      - `user_identifier` (text) - Simpele identifier (naam of sessie)
      - `given_step` (text) - Wat leerling invulde bij "gegeven"
      - `asked_step` (text) - Wat leerling invulde bij "gevraagd"
      - `calculation_step` (text) - Wat leerling invulde bij "berekening"
      - `final_answer` (text) - Het finale antwoord
      - `is_correct` (boolean) - Of het antwoord correct was
      - `feedback` (text) - AI feedback
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on alle tabellen
    - Public read access voor exercises
    - Public insert voor user_attempts (anonieme gebruikers)
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_type text NOT NULL CHECK (formula_type IN ('energie', 'vermogen', 'weerstand')),
  question_text text NOT NULL,
  given_values jsonb NOT NULL,
  asked_variable text NOT NULL,
  correct_answer numeric NOT NULL,
  correct_unit text NOT NULL,
  difficulty text DEFAULT 'gemiddeld' CHECK (difficulty IN ('makkelijk', 'gemiddeld', 'moeilijk')),
  created_at timestamptz DEFAULT now()
);

-- Create user_attempts table
CREATE TABLE IF NOT EXISTS user_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  user_identifier text NOT NULL DEFAULT 'anonymous',
  given_step text NOT NULL,
  asked_step text NOT NULL,
  calculation_step text NOT NULL,
  final_answer text NOT NULL,
  is_correct boolean DEFAULT false,
  feedback text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
CREATE POLICY "Iedereen kan exercises lezen"
  ON exercises
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Iedereen kan exercises aanmaken"
  ON exercises
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for user_attempts
CREATE POLICY "Iedereen kan eigen attempts lezen"
  ON user_attempts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Iedereen kan attempts aanmaken"
  ON user_attempts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_formula_type ON exercises(formula_type);
CREATE INDEX IF NOT EXISTS idx_user_attempts_exercise_id ON user_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_user_identifier ON user_attempts(user_identifier);