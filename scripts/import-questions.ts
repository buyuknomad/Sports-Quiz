// Script to import questions into Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please ensure you have the following in your .env file:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  SUPABASE_SERVICE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importQuestions() {
  try {
    // Read questions from JSON file
    const questionsFile = await fs.readFile(
      path.join(process.cwd(), 'questions.json'),
      'utf-8'
    );
    const questions = JSON.parse(questionsFile);

    // Transform questions for database
    const transformedQuestions = questions.map((q: any) => ({
      external_id: q.id,
      category: q.category.toLowerCase(),
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      active: true
    }));

    console.log(`Found ${transformedQuestions.length} questions to import`);

    // Insert questions in batches of 50
    for (let i = 0; i < transformedQuestions.length; i += 50) {
      const batch = transformedQuestions.slice(i, i + 50);
      const batchNumber = Math.floor(i / 50) + 1;
      const totalBatches = Math.ceil(transformedQuestions.length / 50);
      
      console.log(`Importing batch ${batchNumber} of ${totalBatches} (${batch.length} questions)`);
      
      const { data, error } = await supabase
        .from('questions')
        .upsert(batch, {
          onConflict: 'external_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error inserting batch ${batchNumber}:`, error);
        throw error;
      } else {
        console.log(`Successfully inserted batch ${batchNumber}`);
      }
    }

    console.log('Import completed successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error importing questions:', error.message);
    } else {
      console.error('Unknown error occurred during import');
    }
    process.exit(1);
  }
}

importQuestions();