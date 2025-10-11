import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
});

export const cygnisA1 = googleAI.model('gemini-pro');
export const cygnisA2 = googleAI.model('gemini-2.5-flash');
