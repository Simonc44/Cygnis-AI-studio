import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
});

export const cygnisA1 = googleAI.model('gemini-2.5-flash');
// Cygnis A2 has been removed as it was intended to be a locally downloaded model,
// which is not supported in this web application architecture.
// export const cygnisA2 = googleAI.model('gemini-pro');
