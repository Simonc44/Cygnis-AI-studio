'use server';
/**
 * @fileOverview An AI agent that improves the fluency and coherence of generated answers.
 *
 * - improveAnswerFluency - A function that polishes raw answers for better clarity and professionalism.
 * - ImproveAnswerFluencyInput - The input type for the improveAnswerFluency function.
 * - ImproveAnswerFluencyOutput - The return type for the improveAnswerFluency function.
 */

import {ai, geminiPro} from '@/ai/genkit';
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
  const result = await improveAnswerFluencyFlow(input);
  if (!result?.polishedAnswer) {
      return { polishedAnswer: "The AI failed to produce a polished answer." };
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'improveAnswerFluencyPrompt',
  model: geminiPro,
  input: {schema: ImproveAnswerFluencyInputSchema},
  output: {schema: ImproveAnswerFluencyOutputSchema, optional: true},
  prompt: `You are an expert text editor. Your task is to take a raw text that contains reasoning steps and a final conclusion, and transform it into a single, fluent, and professional answer.

- **Identify and extract only the final conclusion** from the raw text provided.
- **Ignore all reasoning steps**, tool outputs, or preliminary thoughts.
- **Rephrase and polish** the conclusion to be clear, concise, and easy to understand.
- **Do not include source citations** like [Source Title] in your final output; they will be handled separately.
- The output should ONLY be the final, polished answer, without any extra commentary.

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
    
    if (!output?.polishedAnswer) {
        // Fallback in case of empty output
        return { polishedAnswer: input.rawAnswer };
    }
    return output;
  }
);
