'use server';
/**
 * @fileOverview An AI agent that improves the fluency and coherence of generated answers.
 *
 * - improveAnswerFluency - A function that polishes raw answers for better clarity and professionalism.
 * - ImproveAnswerFluencyInput - The input type for the improveAnswerFluency function.
 * - ImproveAnswerFluencyOutput - The return type for the improveAnswerFluency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { cygnisA1 } from '@/ai/genkit';

const ImproveAnswerFluencyInputSchema = z.object({
  question: z.string().describe('The original question asked by the user.'),
  rawAnswer: z.string().describe('The raw, unpolished data and reasoning steps from a previous step, which may include tool outputs and a conclusion.'),
  modelId: z.enum(['A1']).default('A1').describe('The AI model to use.'),
});
export type ImproveAnswerFluencyInput = z.infer<typeof ImproveAnswerFluencyInputSchema>;

const ImproveAnswerFluencyOutputSchema = z.object({
  polishedAnswer: z.string().describe('The polished, final answer, presented clearly and professionally.'),
});
export type ImproveAnswerFluencyOutput = z.infer<typeof ImproveAnswerFluencyOutputSchema>;

export async function improveAnswerFluency(input: ImproveAnswerFluencyInput): Promise<ImproveAnswerFluencyOutput> {
  const result = await improveAnswerFluencyFlow(input);
  if (!result?.polishedAnswer) {
      return { polishedAnswer: "The AI failed to produce a polished answer." };
  }
  return result;
}

const improveAnswerFluencyFlow = ai.defineFlow(
  {
    name: 'improveAnswerFluencyFlow',
    inputSchema: ImproveAnswerFluencyInputSchema,
    outputSchema: ImproveAnswerFluencyOutputSchema,
  },
  async input => {
    const model = cygnisA1; // Always use A1 as A2 is disabled

    const prompt = ai.definePrompt({
      name: `improveAnswerFluencyPrompt_${input.modelId}`,
      model: model,
      input: {schema: ImproveAnswerFluencyInputSchema},
      output: {schema: ImproveAnswerFluencyOutputSchema, optional: true},
      prompt: `You are an expert synthesizer and editor. Your task is to take a user's question and the raw data gathered by an AI, and transform it into a single, fluent, and professional final answer.

- **Synthesize, do not summarize**: Your goal is to construct the best possible answer to the user's original question using the provided raw data.
- **Ignore all reasoning steps**, tool outputs, or preliminary thoughts from the raw data. Use only the factual information.
- **Rephrase and polish** the answer to be clear, concise, and easy to understand.
- **Do not include source citations** like [Source Title] in your final output; they have been handled separately.
- The output should ONLY be the final, polished answer, without any extra commentary.

Original Question:
{{{question}}}

Raw Data and Reasoning from AI:
{{{rawAnswer}}}

Final, Polished Answer:`, 
    });
    
    const {output} = await prompt(input);
    
    if (!output?.polishedAnswer) {
        // Fallback in case of empty output: return the raw answer but clean it a bit.
        const cleanedRawAnswer = input.rawAnswer.replace(/\[([^\]]+)\]/g, '').trim();
        return { polishedAnswer: cleanedRawAnswer };
    }
    return output;
  }
);
