import { GoogleGenerativeAI, TaskType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// Define the type exactly as provided by the user
type GroundingTool = {google_search: Record<string, unknown> }; // Using snake_case as per user file

import { createClient, SupabaseClient, PostgrestError } from "@supabase/supabase-js"; // Import PostgrestError
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Calculate __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load Environment Variables ---
console.log("Attempting to load .env file from '../.env'...");
dotenv.config( );
console.log("dotenv configured (or attempted).");

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const GENERATION_MODEL_NAME = "gemini-2.0-flash";
const EMBEDDING_MODEL_NAME = "text-embedding-004";
const SUPABASE_TABLE_NAME = 'questions';
const INSPIRATION_TABLE_NAME = 'inspiration_topics';
const TARGET_QUESTIONS_COUNT = 10;
const CANDIDATE_QUESTIONS_COUNT = 15;
const SIMILARITY_THRESHOLD = 0.96;
const TOPIC_BATCH_SIZE = 8;
const MAX_RETRIES = 3; // Max retries for Supabase calls
const INITIAL_RETRY_DELAY_MS = 500; // Initial delay before first retry

// Enhanced function to repair and parse potentially malformed JSON
function repairAndParseJSON(text) {
  try {
    // First try direct parsing
    return JSON.parse(text);
  } catch (e) {
    console.log("Initial JSON parsing failed, attempting advanced repair...");
    
    // Store original text for debugging
    const originalText = text;
    
    // Step 1: Basic fixes
    let repairedText = text
      // Fix unquoted property names
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
      // Fix single quotes to double quotes
      .replace(/'/g, '"')
      // Fix trailing commas
      .replace(/,\s*}/g, '}')
      .replace(/,\s*\]/g, ']');
      
    // Step 2: More advanced fixes
    repairedText = repairedText
      // Fix missing commas between elements
      .replace(/}(\s*){/g, '},$1{')
      .replace(/](\s*)\[/g, '],$1[')
      // Fix missing commas between object properties
      .replace(/}(\s*)"([^"]+)":/g, '},$1"$2":');
    
    try {
      console.log("Standard repairs applied - attempting to parse");
      return JSON.parse(repairedText);
    } catch (secondError) {
      console.log("Advanced repair failed, attempting recovery mode...");
      
      // Try to extract a valid array
      try {
        // Look for anything that resembles a JSON array with objects
        const arrayMatch = originalText.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          const extractedArray = arrayMatch[0];
          // Try to parse the extracted array
          return JSON.parse(extractedArray);
        }
      } catch (extractError) {
        console.log("Array extraction failed:", extractError.message);
      }
      
      // Try to extract individual objects and create an array from them
      try {
        const objectRegex = /{[^{]*"category"[^}]*"question"[^}]*"options"[^}]*"correct_answer"[^}]*}/g;
        const matches = originalText.match(objectRegex);
        if (matches && matches.length > 0) {
          console.log(`Found ${matches.length} potential objects, attempting to parse individually`);
          
          const validObjects = [];
          for (const match of matches) {
            try {
              const cleanedObject = match
                .replace(/'/g, '"') // Fix quotes
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3'); // Fix property names
              const parsedObject = JSON.parse(cleanedObject);
              validObjects.push(parsedObject);
            } catch (objError) {
              // Skip invalid objects
            }
          }
          
          if (validObjects.length > 0) {
            console.log(`Successfully extracted ${validObjects.length} valid objects`);
            return validObjects;
          }
        }
      } catch (objError) {
        console.log("Object extraction failed:", objError.message);
      }
      
      // If all else fails, log details for debugging
      console.log("All recovery attempts failed:", secondError.message);
      
      // Log context around the error position
      const posMatch = secondError.message.match(/position (\d+)/);
      if (posMatch) {
        const position = parseInt(posMatch[1]);
        const contextStart = Math.max(0, position - 30);
        const contextEnd = Math.min(repairedText.length, position + 30);
        console.log(`Context around error position ${position}:`, 
          repairedText.substring(contextStart, position) + " [ERROR HERE] " + repairedText.substring(position, contextEnd));
      }
      
      throw new Error("Failed to parse or repair malformed JSON: " + secondError.message);
    }
  }
}

// Interface for inspiration topic records
interface InspirationTopic {
  id: string;
  topic: string;
  category: string;
  last_used_at?: string;
  is_active: boolean;
}

// Type definition
type Category = 'football' | 'basketball' | 'tennis' | 'olympics';
interface TriviaQuestion {
  category: Category;
  question: string;
  options: string[];
  correct_answer: string;
  active?: boolean;
  embedding?: number[];
  explanation?: string;
}

// --- Initialize Clients ---
if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: Core environment variables missing! Check .env file.");
    throw new Error("Missing required environment variables (GEMINI_API_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY)");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const generationModel = genAI.getGenerativeModel({
    model: GENERATION_MODEL_NAME,
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]
});
const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
console.log(`Clients initialized: ${GENERATION_MODEL_NAME} (Gen - Grounded Attempt), ${EMBEDDING_MODEL_NAME} (Embed)`);
const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});
console.log("Supabase client initialized.");
// --- End Initialize Clients ---


// --- Helper Function for Supabase Retries ---
async function supabaseCallWithRetry<T>(
    operationDescription: string,
    supabaseOperation: () => Promise<{ data: T | null; error: PostgrestError | null; count?: number | null }>
): Promise<{ data: T | null; error: PostgrestError | null; count?: number | null }> {
    let retries = 0;
    let delay = INITIAL_RETRY_DELAY_MS;
    while (retries <= MAX_RETRIES) {
        try {
            console.log(`Attempting Supabase operation: ${operationDescription} (Attempt ${retries + 1})`);
            const result = await supabaseOperation();
            if (result.error) {
                 // Check if it's a fetch error eligible for retry
                if (result.error.message.toLowerCase().includes('fetch failed') && retries < MAX_RETRIES) {
                    console.warn(`Supabase fetch failed for "${operationDescription}". Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`, result.error);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    retries++;
                    delay *= 2; // Exponential backoff
                    continue; // Retry the loop
                } else {
                    // Non-retryable error or max retries reached
                    console.error(`Supabase error during "${operationDescription}" (Attempt ${retries + 1}):`, result.error);
                    return result; // Return the error result
                }
            }
            // Operation succeeded
            console.log(`Supabase operation successful: ${operationDescription}`);
            return result; // Return the success result
        } catch (catchError) {
             // Catch unexpected errors during the operation itself
            console.error(`Caught exception during Supabase operation "${operationDescription}" (Attempt ${retries + 1}):`, catchError);
             // Check if the caught error message indicates a fetch failure for retry
            if (catchError instanceof Error && catchError.message.toLowerCase().includes('fetch failed') && retries < MAX_RETRIES) {
                 console.warn(`Caught fetch exception for "${operationDescription}". Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
                 await new Promise(resolve => setTimeout(resolve, delay));
                 retries++;
                 delay *= 2;
                 continue;
            } else {
                 // If it's not a fetch error or retries exhausted, return as an error
                 return { data: null, error: { message: catchError instanceof Error ? catchError.message : 'Unknown caught exception', details: `${catchError}`, hint: '', code: 'CATCH_EXCEPTION' } };
            }
        }
    }
    // Should only reach here if all retries failed
    console.error(`Supabase operation "${operationDescription}" failed after ${MAX_RETRIES} retries.`);
    return { data: null, error: { message: `Operation failed after ${MAX_RETRIES} retries`, details: 'Max retries exceeded', hint: '', code: 'MAX_RETRIES_EXCEEDED' } };
}
// --- End Helper Function ---


// --- Helper function using categories from database records ---
async function generateGroundedCandidateQuestions(
    inspirationList: string, 
    topicsData: InspirationTopic[]
): Promise<TriviaQuestion[] | null> {
    const categories = ['football', 'basketball', 'tennis', 'olympics'];
    const categoryCounts = "football: 4, basketball: 4, tennis: 4, olympics: 3"; // Target: 15 candidates
    const totalCandidates = CANDIDATE_QUESTIONS_COUNT;
    console.log(`Generating ${totalCandidates} GROUNDED candidate questions (distribution: ${categoryCounts}) using ${GENERATION_MODEL_NAME}...`);
    
    // Organize topics by their actual category from database
    const topicsByCategory: Record<string, string[]> = {};
    
    // Initialize arrays for each category
    for (const category of categories) {
        topicsByCategory[category] = [];
    }
    
    // Use the category directly from the database record
    for (const topicRecord of topicsData) {
        const category = topicRecord.category?.toLowerCase();
        const topic = topicRecord.topic;
        
        if (categories.includes(category as Category) && topic) {
            topicsByCategory[category].push(topic);
        }
    }
    
    // Print categorization from database
    for (const category of categories) {
        console.log(`Found ${topicsByCategory[category].length} topics for ${category} (from database)`);
    }
    
    // Select grounding topics
    const sampleSize = Math.min(8, topicsData.length); // Limit number of grounding queries
    let groundingTopics = [];
    
    // Ensure we have at least one topic from each category if possible
    for (const category of categories) {
        if (topicsByCategory[category].length > 0) {
            const randomIndex = Math.floor(Math.random() * topicsByCategory[category].length);
            const randomTopic = topicsByCategory[category][randomIndex];
            groundingTopics.push(randomTopic);
            // Remove used topic to avoid duplicates
            topicsByCategory[category].splice(randomIndex, 1);
        }
    }
    
    // Fill remaining slots with random topics from all categories
    const remainingTopicsFlat = categories.flatMap(category => topicsByCategory[category]);
    while (groundingTopics.length < sampleSize && remainingTopicsFlat.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingTopicsFlat.length);
        groundingTopics.push(remainingTopicsFlat[randomIndex]);
        remainingTopicsFlat.splice(randomIndex, 1);
    }
    
    console.log(`Using specific grounding topics: ${groundingTopics.join(', ')}`);
    
    // Add specific instructions to use these topics for grounding with improved JSON formatting guidance
    const groundingInstruction = `
IMPORTANT: Use these specific topics for your search grounding to find facts: 
${groundingTopics.join(', ')}

Based on the search results for these topics, create factually accurate and interesting questions.

FORMAT REQUIREMENTS:
1. Your response MUST be a valid JSON array ONLY
2. NO explanatory text before or after the JSON
3. Use DOUBLE QUOTES for ALL strings and property names
4. DO NOT use trailing commas in arrays or objects
5. Each object should have EXACTLY these properties: "category", "question", "options", "correct_answer", and "explanation"

Example of valid JSON format:
[
  {
    "category": "football",
    "question": "Which team won the Premier League in 2020?",
    "options": ["Liverpool", "Manchester City", "Chelsea", "Manchester United"],
    "correct_answer": "Liverpool",
    "explanation": "Liverpool won the 2019-20 Premier League title."
  }
]
`;

    // Updated prompt with specific grounding instruction and better JSON formatting guidance
    const prompt = `
${groundingInstruction}

Generate exactly ${totalCandidates} unique, interesting, and specific sports trivia questions with the following category distribution: ${categoryCounts}.
The categories must be exactly: ${categories.join(', ')}. **Use lowercase for category names.**
**Use available search information (grounding) to ensure factual accuracy** and potentially base questions on specific interesting facts found during search.
**Crucial Instructions:**
    1.  **Category:** ALL questions MUST belong to the category: "${categories.join(', ')}".
    2.  **Factual Accuracy & Grounding:** Prioritize verifiable facts. **Use available search information (grounding) extensively to ensure the 'correct_answer' is factually accurate and easily verifiable.** Do NOT invent answers or create questions where the correct answer is ambiguous or subjective. If grounding does not provide a clear answer for a potential question, do not generate that question. Football is soccer, do not generate American football (NFL) questions. Basketball is NBA, European Basketball and National Teams. DO NOT Generate NCAA questions. 
    3.  **Explanation:** For each question, provide a concise, one-sentence explanation justifying why the 'correct_answer' is correct, ideally citing a key fact or reason based on grounding information.
    4.  **Specificity & Difficulty:** Aim for a mix of difficulties (easy, moderate, hard) focusing on specific records, events, achievements, rules, or interesting details related to the topic and category. Easy ones should not be trivial.
    5.  **Distractors:** The incorrect options should be plausible but *clearly* incorrect based on verifiable facts or grounding results.
    6.  **Avoid overly generic questions**. Focus on specific records, historical events, notable player achievements, tournament facts, or interesting details.

    You can also refer to this broader list of topics for additional inspiration on the types of topics to consider:
    ---
    ${inspirationList}
    ---
    For each generated question, provide:
    1. The category (must be one of: ${categories.join(', ')}) - **use lowercase**.
    2. The question text (string, max 200 characters, specific and engaging).
    3. An array of exactly 4 multiple-choice options (string array), including the correct answer. Distractors should be plausible but clearly incorrect based on grounding/facts.
    4. The correct answer (string), which must be one of the options provided and factually correct based on grounding.
    5. explanation: String, a single concise sentence explaining why the answer is correct.

    AGAIN, REMEMBER THAT YOUR RESPONSE MUST BE VALID JSON, WITH DOUBLE QUOTES AROUND ALL KEYS AND STRING VALUES. DO NOT USE SINGLE QUOTES FOR STRINGS OR UNQUOTED PROPERTY NAMES. NO TRAILING COMMAS.
    `;
    
    const groundingTool: GroundingTool = {google_search: {} };
    const toolsConfig = [groundingTool];
    try {
        // Attempt to generate questions with multiple retries for potential JSON errors
        let maxJsonRetries = 3;
        let validQuestions = null;
        
        while (maxJsonRetries > 0 && validQuestions === null) {
            try {
                const result = await generationModel.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }], tools: toolsConfig });
                const response = await result.response;

                if (response?.candidates?.[0]?.groundingMetadata?.webSearchQueries) {
                    console.log(`Grounding queries used: ${response.candidates[0].groundingMetadata.webSearchQueries.join(', ')}`);
                } else if (response?.candidates?.[0]?.groundingMetadata) {
                    console.log("Grounding Metadata Found (but no specific web queries listed).");
                } else {
                    console.log("No grounding metadata found in response.");
                }

                const text = response.text();
                const cleanedText = text.trim().replace(/^```json\s*|```$/g, '');

                if (!cleanedText) {
                    throw new Error("Empty response from AI");
                }

                if (!cleanedText.startsWith('[')) {
                    // Try to find and extract a JSON array from the text
                    const jsonArrayMatch = cleanedText.match(/\[[\s\S]*\]/);
                    if (jsonArrayMatch) {
                        const potentialQuestions = repairAndParseJSON(jsonArrayMatch[0]);
                        validQuestions = potentialQuestions;
                    } else {
                        throw new Error("No JSON array found in the response");
                    }
                } else {
                    // Use the enhanced repair function for better JSON handling
                    const potentialQuestions = repairAndParseJSON(cleanedText);
                    validQuestions = potentialQuestions;
                }
            } catch (jsonError) {
                console.error(`JSON parsing error (attempt ${4 - maxJsonRetries}/3):`, jsonError);
                maxJsonRetries--;
                
                if (maxJsonRetries === 0) {
                    throw new Error("Maximum JSON parsing retries exceeded");
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        if (!Array.isArray(validQuestions)) {
             throw new Error(`Parsed AI response is not an array.`);
        }

        const validCategories: Category[] = ['football', 'basketball', 'tennis', 'olympics'];
        const validatedQuestions = validQuestions
          .filter(q =>
              q &&
              typeof q.category === 'string' &&
              validCategories.includes(q.category.toLowerCase() as Category) &&
              typeof q.question === 'string' && q.question.length > 5 && q.question.length <= 250 &&
              Array.isArray(q.options) && q.options.length === 4 && q.options.every(opt => typeof opt === 'string' && opt.length > 0) &&
              typeof q.correct_answer === 'string' && q.options.includes(q.correct_answer)
          )
          .map(q => ({
              category: q.category.toLowerCase() as Category,
              question: q.question.trim(),
              options: q.options.map((opt: string) => opt.trim()),
              correct_answer: q.correct_answer.trim(),
              explanation: typeof q.explanation === 'string' ? q.explanation.trim() : undefined,
              active: true
          })) as TriviaQuestion[];

        console.log(`Successfully generated and validated ${validatedQuestions.length} candidate questions.`);
        if (validatedQuestions.length < TARGET_QUESTIONS_COUNT) {
            console.warn(`Warning: Generated only ${validatedQuestions.length} valid questions (Target was ${TARGET_QUESTIONS_COUNT} unique from ${CANDIDATE_QUESTIONS_COUNT} candidates).`);
        }
        return validatedQuestions;

    } catch (error) {
        console.error("Error generating or parsing candidate questions:", error);
         if (error instanceof Error) {
             console.error("Error details:", error.message, error.name);
             if (error.message.includes("fetch failed") || error.name === 'TypeError') {
                 console.error(">>> Fetch failed! Network issue or potential problem with grounding API call.");
             } else if (error instanceof SyntaxError) {
                 console.error(">>> JSON Parsing failed! Check the raw AI response if possible.");
             }
         } else { console.error("Unknown error structure:", error); }
        return null;
    }
}

async function generateSingleEmbedding(text: string): Promise<number[] | null> {
    try {
        if (!embeddingModel) throw new Error("Embedding model client not initialized.");
        const result = await embeddingModel.embedContent({
            content: { parts: [{ text: text || " " }], role: "user" },
            taskType: TaskType.RETRIEVAL_DOCUMENT
        });
        const embedding = result.embedding;
        if (embedding?.values && embedding.values.length === 768) {
            return embedding.values;
        } else {
            console.warn(`[Embedding] Failed or wrong dimension (Expected 768, got ${embedding?.values?.length}) for text: "${text.substring(0, 30)}..."`);
            return null;
        }
    } catch (error) {
        console.error(`[Embedding] Error for text "${text.substring(0, 30)}...":`, error instanceof Error ? error.message : error);
        return null;
    }
}

async function isQuestionUnique(embedding: number[]): Promise<boolean> {
    if (!embedding) {
        console.warn("  -> Cannot check uniqueness without embedding.");
        return false;
    }
    console.log(`  -> Checking uniqueness against DB (threshold: ${SIMILARITY_THRESHOLD})...`);
    try {
        // Use the 3-argument version of the function call - ensure your SQL function matches!
        const { data, error } = await supabaseAdmin.rpc('match_question_embedding', {
            query_embedding: embedding,
            match_threshold: SIMILARITY_THRESHOLD,
            match_count: 1
        });

        if (error) {
            if (error.message.includes('function public.match_question_embedding(')) {
                 console.error("  -> Error calling Supabase RPC:", error.message, "(Check function name and arguments in Supabase SQL Editor vs. script call)");
            } else {
                 console.error("  -> Error calling Supabase RPC:", error.message);
            }
            return false; // Treat error as non-unique
        }

        const isUnique = !data || data.length === 0;
        if (!isUnique && data && data.length > 0) {
            console.log(`  -> Potential duplicate found. Similarity: ${data[0]?.similarity?.toFixed(4)} > ${SIMILARITY_THRESHOLD}. Existing Q: "${data[0]?.question?.substring(0, 40)}..." (ID: ${data[0]?.id})`);
        } else {
            console.log(`  -> Question appears unique (No existing question found above similarity threshold ${SIMILARITY_THRESHOLD}).`);
        }
        return isUnique;

    } catch (rpcError) {
        console.error("  -> Supabase RPC call 'match_question_embedding' failed:", rpcError);
        return false;
    }
}
// --- End Helper Functions ---


// --- Modified insertQuestionsIntoDB using the retry helper ---
async function insertQuestionsIntoDB(questions: TriviaQuestion[]): Promise<boolean> {
    if (!questions || questions.length === 0) {
        console.log("No new unique questions to insert.");
        return true;
    }
    console.log(`Attempting to insert ${questions.length} unique questions into Supabase table '${SUPABASE_TABLE_NAME}'...`);

    const questionsToInsert = questions.map(q => ({
        category: q.category, question: q.question, options: q.options,
        correct_answer: q.correct_answer, active: q.active ?? true, embedding: q.embedding, explanation: q.explanation
    }));

    const INSERT_CHUNK_SIZE = 20;
    let overallSuccess = true;
    let totalSuccessfulInserts = 0;

    for (let i = 0; i < questionsToInsert.length; i += INSERT_CHUNK_SIZE) {
        const chunk = questionsToInsert.slice(i, i + INSERT_CHUNK_SIZE);
        const batchNumber = Math.floor(i / INSERT_CHUNK_SIZE) + 1;

        // Use the retry helper for the insert operation
        const { error, count } = await supabaseCallWithRetry(
            `Insert questions chunk ${batchNumber}`,
            () => supabaseAdmin.from(SUPABASE_TABLE_NAME).insert(chunk)
            // Removed .select() here as it was causing issues previously
            // Rely on count potentially returned by insert or estimate
        );

        if (error) {
            console.error(`Failed to insert chunk ${batchNumber} after retries:`, error.message);
            overallSuccess = false;
            // Consider whether to break or continue if a chunk fails after retries
            // break;
        } else {
            const insertedCount = count ?? chunk.length; // Estimate if count is null
            console.log(`Successfully submitted insert for chunk ${batchNumber} (approx ${insertedCount} questions).`);
            totalSuccessfulInserts += insertedCount;
        }
    }

    console.log(`Total estimated inserted questions: ${totalSuccessfulInserts} / ${questions.length}`);
    return overallSuccess; // Returns true if all chunks submitted without final errors
}

// --- Function to fetch balanced topics across categories ---
async function fetchBalancedTopics() {
  console.log("Fetching balanced topics across categories...");
  
  // First, get all available categories
  const { data: categoriesRawData, error: categoryError } = await supabaseCallWithRetry(
    "Fetch categories",
    () => supabaseAdmin
      .from(INSPIRATION_TABLE_NAME)
      .select('category')
      .eq('is_active', true)
  );
  
  if (categoryError || !categoriesRawData || categoriesRawData.length === 0) {
    console.warn("Unable to fetch categories, falling back to simple query");
    return fallbackTopicFetch();
  }
  
  // Extract unique categories using a Set
  const categories = [...new Set(categoriesRawData.map(item => item.category))];
  console.log(`Found ${categories.length} unique categories: ${categories.join(', ')}`);
  
  // Calculate topics per category to maintain balance
  const topicsPerCategory = Math.floor(TOPIC_BATCH_SIZE / categories.length);
  const remainingTopics = TOPIC_BATCH_SIZE % categories.length;
  console.log(`Will fetch ~${topicsPerCategory} topics per category (${remainingTopics} categories get +1)`);
  
  // For each category, fetch its least recently used topics
  let allTopics = [];
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    // Get extra topic for initial categories if there are remainders
    const limit = i < remainingTopics ? topicsPerCategory + 1 : topicsPerCategory;
    
    const { data: categoryTopics, error: topicsError } = await supabaseCallWithRetry(
      `Fetch topics for ${category}`,
      () => supabaseAdmin
        .from(INSPIRATION_TABLE_NAME)
        .select('id, topic, category')
        .eq('is_active', true)
        .eq('category', category)
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .limit(limit)
    );
    
    if (!topicsError && categoryTopics && categoryTopics.length > 0) {
      console.log(`Retrieved ${categoryTopics.length} topics from category '${category}'`);
      allTopics = [...allTopics, ...categoryTopics];
    } else {
      console.warn(`No topics found for category '${category}' or error occurred`);
    }
  }
  
  if (allTopics.length === 0) {
    console.warn("No topics found from any category, falling back to default fetch");
    return fallbackTopicFetch();
  }
  
  console.log(`Successfully fetched ${allTopics.length} balanced topics across ${categories.length} categories`);
  return allTopics;
}

// Fallback function to get topics without category balancing
async function fallbackTopicFetch() {
  console.log("Using fallback method to fetch topics without category balancing...");
  
  const { data: topicsData, error: topicsError } = await supabaseCallWithRetry(
    "Fetch inspiration topics (fallback)",
    () => supabaseAdmin
      .from(INSPIRATION_TABLE_NAME)
      .select('id, topic, category')
      .eq('is_active', true)
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(TOPIC_BATCH_SIZE)
  );
  
  if (topicsError || !topicsData || topicsData.length === 0) {
    console.warn("Fallback topic fetch failed or returned no results");
    return [];
  }
  
  console.log(`Fallback method fetched ${topicsData.length} topics`);
  return topicsData;
}


// --- Main Execution Logic ---
async function runDailyGeneration() {
    console.log(`--- Starting daily question generation process: ${new Date().toISOString()} ---`);

    // --- Fetch Topics with Balanced Categories ---
    console.log("Fetching inspiration topics with category balance...");
    let inspirationList = "General sports knowledge"; // Default fallback
    
    // Use the new balanced topic fetch function
    const topicsData = await fetchBalancedTopics();
    
    let topicIdsToUpdate = [];
    
    if (topicsData.length > 0) {
        console.log(`Successfully fetched ${topicsData.length} balanced topics for inspiration`);
        const selectedTopics = topicsData.map(t => t.topic);
        topicIdsToUpdate = topicsData.map(t => t.id);
        inspirationList = selectedTopics.join('\n');
    } else {
        console.warn("No active inspiration topics found or returned. Using default inspiration.");
    }
    // --- End Fetch Topics ---


    // --- Generate Candidate Questions ---
    // Pass the full topicsData array to use categories from the database
    const candidates = await generateGroundedCandidateQuestions(inspirationList, topicsData);
    if (!candidates || candidates.length === 0) {
        console.log("Failed to generate candidate questions. Exiting.");
        return;
    }


    // --- Filter for Unique Questions ---
    const uniqueQuestions: TriviaQuestion[] = [];
    let checkAttempts = 0;
    const maxCheckAttempts = candidates.length + 10;
    console.log(`Checking ${candidates.length} candidates for uniqueness (Target: ${TARGET_QUESTIONS_COUNT})...`);
    for (const candidate of candidates) {
        if (uniqueQuestions.length >= TARGET_QUESTIONS_COUNT) {
            console.log(`Reached target of ${TARGET_QUESTIONS_COUNT} unique questions.`);
            break;
        }
        if (checkAttempts++ >= maxCheckAttempts) {
             console.warn("Reached max check attempts for uniqueness. Proceeding with found unique questions.");
             break;
        }
        console.log(`Processing candidate: [${candidate.category}] "${candidate.question.substring(0, 40)}..."`);
        const embedding = await generateSingleEmbedding(candidate.question);
        if (!embedding) {
             console.warn(`  -> No embedding generated. Skipping uniqueness check.`);
             await new Promise(resolve => setTimeout(resolve, 50));
             continue;
        }
        candidate.embedding = embedding;
        const unique = await isQuestionUnique(embedding);
        if (unique) {
            console.log("  -> Adding unique question to list.");
            uniqueQuestions.push(candidate);
        } else {
            console.log(`  -> Question NOT unique based on similarity threshold. Skipping.`);
        }
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    // --- End Filter Unique ---


    // --- Insert Unique Questions (Uses retry helper internally) ---
    console.log(`Found ${uniqueQuestions.length} unique questions after checking candidates.`);
    const questionsToInsert = uniqueQuestions.slice(0, TARGET_QUESTIONS_COUNT);
    let insertSuccessful = false;
    if (questionsToInsert.length > 0) {
        insertSuccessful = await insertQuestionsIntoDB(questionsToInsert);
    } else {
        console.log("No unique new questions identified to insert.");
    }
    // --- End Insert Unique ---


    // --- Update Timestamps for Used Topics ---
    if (topicIdsToUpdate && topicIdsToUpdate.length > 0) {
      console.log(`Updating last_used_at for ${topicIdsToUpdate.length} inspiration topics using UPSERT...`);
      
      try {
        // 1. First, fetch the complete topic records to get all required fields
        const { data: topicsData, error: fetchError } = await supabaseAdmin
          .from(INSPIRATION_TABLE_NAME)
          .select('id, topic, category')  // Include all required fields
          .in('id', topicIdsToUpdate);
          
        if (fetchError) {
          console.error("Error fetching topics for upsert:", fetchError);
          return;
        }
        
        if (!topicsData || topicsData.length === 0) {
          console.warn("No topics found for upsert operation");
          return;
        }
        
        // 2. Create the upsert data with ALL required fields
        const now = new Date().toISOString();
        const updates = topicsData.map(topic => ({
          id: topic.id,
          topic: topic.topic,           // Include the required topic field
          category: topic.category,     // Include any other required fields
          last_used_at: now            // The field we want to update
        }));
        
        // 3. Perform the upsert
        const { error: upsertError } = await supabaseAdmin
          .from(INSPIRATION_TABLE_NAME)
          .upsert(updates, { 
            onConflict: 'id',
            returning: 'minimal' 
          });
        
        if (upsertError) {
          console.error("Error during topic timestamp upsert:", upsertError.message);
        } else {
          console.log(`Successfully updated last_used_at for ${updates.length} topics.`);
        }
      } catch (e) {
        console.error("Exception during timestamp update:", e);
      }
    }
    // --- End Update Timestamps ---

    console.log(`--- Daily question generation process finished: ${new Date().toISOString()} ---`);
}

// --- Run the script ---
runDailyGeneration().catch(err => {
    console.error("Unhandled critical error during daily generation:", err);
    process.exit(1);
});
