'use server';

/**
 * @fileOverview A flow to answer questions using relevant Wikipedia excerpts.
 *
 * - contextualWikipediaAnswer - A function that takes a question and returns an answer generated from Wikipedia excerpts.
 * - ContextualWikipediaAnswerInput - The input type for the contextualWikipediaAnswer function.
 * - ContextualWikipediaAnswerOutput - The return type for the contextualWikipediaAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualWikipediaAnswerInputSchema = z.object({
  question: z.string().describe('The question to answer using Wikipedia excerpts.'),
});
export type ContextualWikipediaAnswerInput = z.infer<typeof ContextualWikipediaAnswerInputSchema>;

const ContextualWikipediaAnswerOutputSchema = z.object({
  answer: z.string().describe('The answer generated from Wikipedia excerpts.'),
  sources: z.array(z.string()).describe('The sources used to generate the answer.'),
});
export type ContextualWikipediaAnswerOutput = z.infer<typeof ContextualWikipediaAnswerOutputSchema>;

export async function contextualWikipediaAnswer(input: ContextualWikipediaAnswerInput): Promise<ContextualWikipediaAnswerOutput> {
  return contextualWikipediaAnswerFlow(input);
}

const retrieveWikipediaExcerpts = ai.defineTool({
  name: 'retrieveWikipediaExcerpts',
  description: 'Retrieves relevant excerpts from Wikipedia based on the query.',
  inputSchema: z.object({
    query: z.string().describe('The search query to retrieve Wikipedia excerpts.'),
  }),
  outputSchema: z.array(z.object({
    title: z.string().describe('The title of the Wikipedia page.'),
    text: z.string().describe('The excerpt from the Wikipedia page.'),
  })),
},
async (input) => {
  // TODO: Implement the Wikipedia retrieval logic here
  // This is a placeholder; replace with actual retrieval from FAISS index.
  // For now, return some dummy data.
  return [
    {
      title: 'Example Wikipedia Article',
      text: 'This is an example excerpt from a Wikipedia article.',
    },
  ];
});


const answerQuestionPrompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: ContextualWikipediaAnswerInputSchema},
  output: {schema: ContextualWikipediaAnswerOutputSchema},
  tools: [retrieveWikipediaExcerpts],
  prompt: `You are Cygnis A1, an expert assistant. Use only the provided Wikipedia excerpts to answer the question and cite the sources between brackets.

Question: {{{question}}}

Instructions: Show your reasoning step by step and then provide the conclusion. Use only the provided excerpts.

Answer:\nSteps:\n1.`,
});

const contextualWikipediaAnswerFlow = ai.defineFlow(
  {
    name: 'contextualWikipediaAnswerFlow',
    inputSchema: ContextualWikipediaAnswerInputSchema,
    outputSchema: ContextualWikipediaAnswerOutputSchema,
  },
  async input => {
    const {output} = await answerQuestionPrompt(input);
    // TODO: Post-processing to extract sources from the answer.
    return {
      answer: output?.answer ?? 'An error occurred while generating the answer.',
      sources: [], // Replace with actual sources extracted from the answer
    };
  }
);
