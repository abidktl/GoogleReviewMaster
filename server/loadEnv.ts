import dotenv from 'dotenv';
import path from 'path';

// Resolve path to .env in the project root (assuming loadEnv.ts is in server/)
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[loadEnv.ts] Error loading .env file:', result.error);
} else {
  console.log('[loadEnv.ts] .env file loaded successfully from:', envPath);
  if (result.parsed) {
    console.log('[loadEnv.ts] Variables loaded:', Object.keys(result.parsed));
  }
}

console.log('[loadEnv.ts] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('[loadEnv.ts] GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
