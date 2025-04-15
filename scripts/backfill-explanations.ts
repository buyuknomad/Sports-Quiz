import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { createClient, SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Calculate __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load Environment Variables ---
console.log("Attempting to load .env file...");
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log("dotenv configured (or attempted).");

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const GENERATION_MODEL_NAME = "gemini-1.5-flash-latest"; // Using latest flash model
const SUPABASE_TABLE_NAME = 'questions';
const BATCH_SIZE = 25;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 500;
const API_CALL_DELAY_MS = 100;

// --- Type Definition ---
type Category = 'football' | 'basketball' | 'tennis' | 'olympics' | 'mixed';
interface QuestionRecord {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string | null;
}

// --- Initialize Clients ---
if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: Core environment variables missing!");
    process.exit(1);
}
let generationModel;
try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    generationModel = genAI.getGenerativeModel({ model: GENERATION_MODEL_NAME });
    console.log(`Gemini client initialized for model: ${GENERATION_MODEL_NAME}`);
} catch (e) {
    console.error(`Failed to initialize Gemini model ${GENERATION_MODEL_NAME}:`, e);
    process.exit(1);
}
const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});
console.log("Supabase client initialized.");

// --- Supabase Retry Helper (unchanged) ---
async function supabaseCallWithRetry<T>(
    operationDescription: string,
    supabaseOperation: () => Promise<{ data: T | null; error: PostgrestError | null; count?: number | null }>
): Promise<{ data: T | null; error: PostgrestError | null; count?: number | null }> {
    let retries = 0;
    let delay = INITIAL_RETRY_DELAY_MS;
    while (retries <= MAX_RETRIES) {
        try {
            const result = await supabaseOperation();
            if (result.error) {
                if (result.error.message.toLowerCase().includes('fetch failed') && retries < MAX_RETRIES) {
                    console.warn(`Supabase fetch failed for "${operationDescription}". Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`, result.error);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    retries++;
                    delay *= 2;
                    continue;
                } else {
                    console.error(`Supabase error during "${operationDescription}" (Attempt ${retries + 1}):`, result.error);
                    return result;
                }
            }
            return result;
        } catch (catchError) {
            console.error(`Caught exception during Supabase operation "${operationDescription}" (Attempt ${retries + 1}):`, catchError);
            if (catchError instanceof Error && catchError.message.toLowerCase().includes('fetch failed') && retries < MAX_RETRIES) {
                console.warn(`Caught fetch exception for "${operationDescription}". Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
                delay *= 2;
                continue;
            } else {
                return { data: null, error: { message: catchError instanceof Error ? catchError.message : 'Unknown caught exception', details: `${catchError}`, hint: '', code: 'CATCH_EXCEPTION' } };
            }
        }
    }
    console.error(`Supabase operation "${operationDescription}" failed after ${MAX_RETRIES} retries.`);
    return { data: null, error: { message: `Operation failed after ${MAX_RETRIES} retries`, details: 'Max retries exceeded', hint: '', code: 'MAX_RETRIES_EXCEEDED' } };
}

// --- Generate Explanation Helper (unchanged) ---
async function generateExplanation(question: QuestionRecord): Promise<string | null> {
    if (!generationModel) {
        console.error("Generation model not initialized.");
        return null;
    }
    const prompt = `
Given the following sports trivia question and its correct answer:
Question: "${question.question}"
Options: ${JSON.stringify(question.options)}
Correct Answer: "${question.correct_answer}"

Provide a concise, single-sentence explanation for why the correct answer is correct.
Explanation:`;

    try {
        console.log(` -> Generating explanation for Q ID: ${question.id.substring(0, 8)}... "${question.question.substring(0, 40)}..."`);
        const result = await generationModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        let explanation = text.replace(/^["'`\*\-]+|["'`\*\-]+$/g, "");
        if (!explanation.endsWith('.')) {
            explanation += '.';
        }
        console.log(`   -> Explanation generated: "${explanation.substring(0, 60)}..."`);
        return explanation;
    } catch (error) {
        console.error(`Error generating explanation for Q ID ${question.id}:`, error);
        return null;
    }
}

// --- *** MODIFIED Helper Function to Update Explanations in DB *** ---
async function updateExplanationsInDB(updates: { id: string; explanation: string }[]): Promise<number> {
    console.log(`[DB Update] Attempting to update ${updates.length} explanations individually...`);
    if (!updates || updates.length === 0) {
        console.log("[DB Update] No valid updates to perform.");
        return 0;
    }

    let successfulUpdatesCount = 0;
    for (const update of updates) {
        const { error } = await supabaseCallWithRetry( // Use retry wrapper for each update
            `Update explanation for ID ${update.id.substring(0, 8)}`,
            () => supabaseAdmin
                .from(SUPABASE_TABLE_NAME)
                .update({ explanation: update.explanation }) // Only update the explanation field
                .eq('id', update.id) // Match the specific question ID
                .select('id', { count: 'exact', head: true }) // Check if update occurred, minimal return
        );

        if (error) {
            console.error(`[DB Update] Failed update for ID ${update.id}:`, error.message);
            // Continue to next update even if one fails
        } else {
            successfulUpdatesCount++;
            console.log(`  -> Successfully updated explanation for ID ${update.id.substring(0,8)}...`);
        }
         // Optional small delay between individual updates
         await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`[DB Update] Finished individual updates. Successfully updated ${successfulUpdatesCount}/${updates.length} questions.`);
    return successfulUpdatesCount;
}
// --- *** End of MODIFIED Function *** ---

// --- Main Execution Logic (Single Batch - unchanged) ---
async function runSingleBatchExplanationBackfill() {
    console.log(`--- Starting explanation backfill process for table '${SUPABASE_TABLE_NAME}' (Single Batch of ${BATCH_SIZE}) ---`);
    let totalQuestionsProcessed = 0;
    let totalQuestionsUpdated = 0;

    console.log(`Workspaceing up to ${BATCH_SIZE} questions needing explanation...`);
    const { data: batchToProcess, error: fetchError } = await supabaseCallWithRetry<QuestionRecord[]>(
        `Workspace single batch of ${BATCH_SIZE} questions needing explanation`,
        () => supabaseAdmin
            .from(SUPABASE_TABLE_NAME)
            .select('id, question, options, correct_answer, category')
            .or('explanation.is.null,explanation.eq.')
            .limit(BATCH_SIZE)
    );

    if (fetchError) {
        console.error("Failed to fetch questions batch after multiple retries. Stopping.", fetchError);
        return;
    }
    if (!batchToProcess || batchToProcess.length === 0) {
        console.log("No more questions found without explanations. Nothing to do.");
        return;
    }

    console.log(`Processing fetched batch of ${batchToProcess.length} questions.`);
    totalQuestionsProcessed = batchToProcess.length;

    const updates: { id: string; explanation: string }[] = [];
    for (const question of batchToProcess) {
        const explanation = await generateExplanation(question);
        if (explanation) {
            updates.push({ id: question.id, explanation });
        } else {
            console.warn(`  -> Skipping update for question ID ${question.id}: Explanation generation failed.`);
        }
        if (API_CALL_DELAY_MS > 0) {
           await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS));
        }
    }

    if (updates.length > 0) {
        // Call the modified update function
        const successfulUpdatesCount = await updateExplanationsInDB(updates);
        totalQuestionsUpdated = successfulUpdatesCount;
    } else {
        console.log("No valid explanations generated for this batch, skipping DB update.");
    }

    console.log(`--- Explanation backfill (Single Batch) finished ---`);
    console.log(`Questions processed in this run: ${totalQuestionsProcessed}`);
    console.log(`Questions successfully updated in this run: ${totalQuestionsUpdated}`);
}

// --- Run the script ---
runSingleBatchExplanationBackfill().catch(err => {
    console.error("Unhandled critical error during single batch explanation backfill:", err);
    process.exit(1);
});