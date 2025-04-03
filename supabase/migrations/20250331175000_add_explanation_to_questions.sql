-- Add an explanation column to the questions table
ALTER TABLE public.questions
ADD COLUMN explanation TEXT NULL;

-- Optional: Add a comment to the column for clarity in database tools
COMMENT ON COLUMN public.questions.explanation IS 'One-sentence explanation for why the correct_answer is correct.';