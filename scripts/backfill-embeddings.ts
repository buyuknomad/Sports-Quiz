import { GoogleGenerativeAI, TaskType } from "@google/generative-ai"; // Use this library
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv'; // Keep dotenv lines as requested previously

// Load environment variables
console.log("Attempting to load .env file from '../.env'...");
dotenv.config( );
console.log("dotenv configured (or attempted).");

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// *** Use the Gemini embedding model name ***
const EMBEDDING_MODEL_NAME = "text-embedding-004"; // Changed model name
const SUPABASE_TABLE_NAME = 'questions';
const BATCH_SIZE = 50; // Batch size for fetching from Supabase

// --- Initialize Clients ---
if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: Core environment variables missing! Check .env file and StackBlitz Secrets.");
    throw new Error("Missing required environment variables (GEMINI_API_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY)");
}

// Initialize Gemini Client for the embedding model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
let embeddingModel;
try {
    embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
    console.log(`Gemini client initialized for model: ${EMBEDDING_MODEL_NAME}`);
} catch (e) {
     console.error(`Failed to initialize Gemini model ${EMBEDDING_MODEL_NAME}`, e);
     throw e; // Stop if model init fails
}

// Initialize Supabase Admin client
const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});
console.log("Supabase client initialized.");

// --- Helper Function ---
/**
 * Generates an embedding for a single text using embedContent.
 */
async function generateSingleEmbedding(text: string): Promise<number[] | null> {
    try {
        // Check if embeddingModel was initialized
        if (!embeddingModel) throw new Error("Embedding model client not initialized.");

        const result = await embeddingModel.embedContent({
            content: { parts: [{ text: text || " " }], role: "user" },
            taskType: TaskType.RETRIEVAL_DOCUMENT, // Appropriate for storing searchable embeddings
        });
        const embedding = result.embedding;
        // Verify embedding exists and has the expected dimension (usually 768 for embedding-001 too)
        if (embedding?.values && embedding.values.length === 768) {
            return embedding.values;
        } else {
            console.warn(`[generateSingleEmbedding] Embedding generation failed or wrong dimension (Expected 768, got ${embedding?.values?.length}) for text: "${text.substring(0, 30)}..."`);
            return null;
        }
    } catch (error) {
        console.error(`[generateSingleEmbedding] Error for text "${text.substring(0, 30)}...": ${error}`);
        if (error instanceof Error) {
            console.error("Error details:", error.message);
        }
        return null;
    }
}

/**
 * Updates Supabase records with their generated embeddings.
 */
async function updateEmbeddingsInDB(updates: { id: string; embedding: number[] }[]) {
    console.log(`[updateEmbeddingsInDB] Called for ${updates.length} updates.`);
    if (!updates || updates.length === 0) {
        console.log("[updateEmbeddingsInDB] No valid updates to send.");
        return 0;
    }
    const updatePromises = updates.map(item =>
        supabaseAdmin
            .from(SUPABASE_TABLE_NAME)
            .update({ embedding: item.embedding })
            .eq('id', item.id)
    );
    console.log(`[updateEmbeddingsInDB] Sending ${updatePromises.length} update requests...`);
    const results = await Promise.allSettled(updatePromises);
    console.log(`[updateEmbeddingsInDB] Update requests finished.`);
    let successCount = 0;
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            if (result.value.error) {
                 console.error(`[updateEmbeddingsInDB] Failed update for ID ${updates[index].id}:`, result.value.error.message);
            } else {
                successCount++;
            }
        } else {
            console.error(`[updateEmbeddingsInDB] Failed update for ID ${updates[index].id} (Promise rejected):`, result.reason);
        }
    });
    console.log(`[updateEmbeddingsInDB] Successfully updated ${successCount}/${updates.length} questions.`);
    return successCount;
}

// --- Main Execution Logic ---
async function runBackfill() {
    console.log(`--- Starting embedding backfill process (using ${EMBEDDING_MODEL_NAME} via @google/generative-ai) for table '${SUPABASE_TABLE_NAME}' ---`);
    let offset = 0;
    let totalQuestionsProcessed = 0;
    let totalQuestionsUpdated = 0;
    const MAX_FETCH_RETRIES = 3;

    while (true) {
        let currentBatch: any[] | null = null;
        let fetchError: any = null;
        let retries = 0;

        // Fetch batch with retries
        while(retries < MAX_FETCH_RETRIES && !currentBatch) {
            console.log(`Workspaceing questions batch (Attempt ${retries + 1}/${MAX_FETCH_RETRIES}) starting from offset ${offset}...`);
            const { data, error } = await supabaseAdmin
                .from(SUPABASE_TABLE_NAME)
                .select('id, question')
                .is('embedding', null)
                .range(offset, offset + BATCH_SIZE - 1);

            if (error) {
                console.error(`Error fetching questions (Attempt ${retries + 1}):`, error.message);
                fetchError = error;
                retries++;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 500));
            } else {
                console.log(`Workspace successful. Found ${data?.length ?? 0} questions needing embedding.`);
                currentBatch = data;
                fetchError = null;
                break;
            }
        }

        if (fetchError) {
            console.error("Failed to fetch questions after multiple retries. Stopping backfill.");
            break;
        }
        if (!currentBatch || currentBatch.length === 0) {
            console.log("No more questions found without embeddings. Backfill complete.");
            break;
        }

        totalQuestionsProcessed += currentBatch.length;
        console.log(`Processing fetched batch of ${currentBatch.length} questions (Total processed: ${totalQuestionsProcessed}). Generating embeddings individually...`);

        const updates: { id: string; embedding: number[] }[] = [];

        for (const question of currentBatch) {
            const textToEmbed = question.question || ' ';
            const embedding = await generateSingleEmbedding(textToEmbed);
            if (embedding) { // Check includes dimension check now
                updates.push({ id: question.id, embedding: embedding });
            } else {
                 console.warn(`Skipping update for question ID ${question.id}: Embedding generation failed or invalid.`);
            }
            // Delay between API calls
            await new Promise(resolve => setTimeout(resolve, 50)); // Adjust delay if needed
        }
        console.log(`Finished generating embeddings for batch. ${updates.length} successful.`);


        if (updates.length > 0) {
           const successfulUpdatesCount = await updateEmbeddingsInDB(updates);
           totalQuestionsUpdated += successfulUpdatesCount;
        } else {
            console.log("No valid embeddings generated for this batch, skipping DB update.");
        }

        offset += currentBatch.length;
        console.log(`Batch finished. Moving to next offset: ${offset}`);
    }

    console.log("Exited main processing loop.");
    console.log(`--- Embedding backfill process finished ---`);
    console.log(`Total questions checked/processed: ${totalQuestionsProcessed}`);
    console.log(`Total questions successfully updated with embeddings: ${totalQuestionsUpdated}`);
}

// --- Run the script ---
runBackfill().catch(err => {
    console.error("Unhandled critical error during embedding backfill:", err);
    process.exit(1);
});