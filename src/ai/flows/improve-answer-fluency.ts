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
  rawAnswer: z.string().describe('The raw, unpolished answer from a previous step, which may include reasoning and a final conclusion.'),
});
export type ImproveAnswerFluencyInput = z.infer<typeof ImproveAnswerFluencyInputSchema>;

const ImproveAnswerFluencyOutputSchema = z.object({
  polishedAnswer: z.string().describe('The polished, final answer, presented clearly and professionally.'),
});
export type ImproveAnswerFluencyOutput = z.infer<typeof ImproveAnswerFluencyOutputSchema>;

export async function improveAnswerFluency(input: ImproveAnswerFluencyInput): Promise<ImproveAnswerFluencyOutput> {
  return improveAnswerFluencyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveAnswerFluencyPrompt',
  input: {schema: ImproveAnswerFluencyInputSchema},
  output: {schema: ImproveAnswerFluencyOutputSchema},
  prompt: `You are an expert text editor and polisher. Your task is to take a raw text that contains reasoning steps and a conclusion, and transform it into a single, fluent, and professional answer.

- Extract the final conclusion from the raw text.
- Rephrase and refine the conclusion to be clear, concise, and easy to understand.
- Do NOT include the original reasoning steps in your final output.
- The output should only be the final, polished answer.

Raw Answer:
{{{rawAnswer}}}

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
