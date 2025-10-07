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

const ImproveAnswerFluencyInputSchema = z.object({
  rawAnswer: z.string().describe('The raw answer to be polished.'),
});
export type ImproveAnswerFluencyInput = z.infer<typeof ImproveAnswerFluencyInputSchema>;

const ImproveAnswerFluencyOutputSchema = z.object({
  polishedAnswer: z.string().describe('The polished answer with improved fluency and coherence.'),
});
export type ImproveAnswerFluencyOutput = z.infer<typeof ImproveAnswerFluencyOutputSchema>;

export async function improveAnswerFluency(input: ImproveAnswerFluencyInput): Promise<ImproveAnswerFluencyOutput> {
  return improveAnswerFluencyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveAnswerFluencyPrompt',
  input: {schema: ImproveAnswerFluencyInputSchema},
  output: {schema: ImproveAnswerFluencyOutputSchema},
  prompt: `You are an expert text polisher. Your task is to improve the fluency and coherence of the given raw answer.

Raw Answer: {{{rawAnswer}}}

Polished Answer:`, 
});

const improveAnswerFluencyFlow = ai.defineFlow(
  {
    name: 'improveAnswerFluencyFlow',
    inputSchema: ImproveAnswerFluencyInputSchema,
    outputSchema: ImproveAnswerFluencyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
