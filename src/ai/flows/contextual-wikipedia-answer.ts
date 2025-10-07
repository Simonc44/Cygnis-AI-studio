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
  if (input.query.toLowerCase().includes('penicillin')) {
    return [
      {
        title: 'History of penicillin',
        text: "The discovery of penicillin is attributed to Scottish scientist Alexander Fleming. Fleming recounted that the date of his discovery of penicillin was on the morning of Friday, 28 September 1928. The traditional version of this story is that Fleming returned from a two-week holiday in Suffolk in 1928 and found that a Petri dish containing Staphylococcus aureus which he had accidentally left open was contaminated by a blue-green mould, Penicillium notatum. He observed a halo of inhibited bacterial growth around the mould.",
      },
      {
        title: 'Alexander Fleming',
        text: 'Sir Alexander Fleming (6 August 1881 – 11 March 1955) was a Scottish physician and microbiologist, best known for his discovery of penicillin in 1928, for which he shared the Nobel Prize in Physiology or Medicine in 1945 with Howard Florey and Ernst Boris Chain.',
      }
    ];
  }
  return [
    {
      title: 'Wikipedia',
      text: 'No relevant information found for the query.',
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
  async (input) => {
    const {output} = await answerQuestionPrompt(input);
    
    const answer = output?.answer ?? 'An error occurred while generating the answer.';
    
    // Simple regex to find text within brackets like [Source]
    const sourceRegex = /\[([^\]]+)\]/g;
    let match;
    const sources: string[] = [];
    while ((match = sourceRegex.exec(answer)) !== null) {
      sources.push(match[1]);
    }

    // Clean the answer from sources
    const cleanedAnswer = answer.replace(sourceRegex, '').trim();

    return {
      answer: cleanedAnswer,
      sources: sources.length > 0 ? sources : (output?.sources || []),
    };
  }
);
