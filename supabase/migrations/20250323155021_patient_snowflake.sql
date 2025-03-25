/*
  # Quiz Database Schema

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `category` (question_category) - football, basketball, tennis, olympics, mixed
      - `question` (text) - the actual question
      - `options` (text[]) - array of possible answers
      - `correct_answer` (text) - the correct answer
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `external_id` (text) - original ID from JSON file
      - `active` (boolean) - to soft delete questions

  2. Security
    - Enable RLS on questions table
    - Add policy for public read access to active questions
*/

-- Safe creation of enum type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_category') THEN
    CREATE TYPE question_category AS ENUM (
      'football',
      'basketball',
      'tennis',
      'olympics',
      'mixed'
    );
  END IF;
END $$;

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category question_category NOT NULL,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  external_id text UNIQUE,
  active boolean DEFAULT true,
  CONSTRAINT options_length CHECK (array_length(options, 1) = 4),
  CONSTRAINT correct_answer_in_options CHECK (correct_answer = ANY(options))
);

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS questions_category_idx ON questions(category);
CREATE INDEX IF NOT EXISTS questions_active_idx ON questions(active);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'questions' 
    AND policyname = 'Anyone can read active questions'
  ) THEN
    CREATE POLICY "Anyone can read active questions"
      ON questions
      FOR SELECT
      USING (active = true);
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_questions_updated_at'
  ) THEN
    CREATE TRIGGER update_questions_updated_at
      BEFORE UPDATE ON questions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;