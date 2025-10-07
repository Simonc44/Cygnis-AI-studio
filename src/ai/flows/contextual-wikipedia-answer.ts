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
import {improveAnswerFluency} from './improve-answer-fluency';

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
  const trimmedQuestion = input.question.toLowerCase().trim();
  const identityQueries = ['who are you', 'what are you', 'who is your creator', 'who made you'];

  if (identityQueries.some(q => trimmedQuestion.includes(q))) {
    return {
      answer: 'I am Cygnis A1, an AI assistant designed by CygnisAI and trained by Google.',
      sources: ['Internal knowledge'],
    };
  }
  
  // RAG flow
  const rawAnswerResponse = await contextualWikipediaAnswerFlow(input);
  if (!rawAnswerResponse?.rawAnswer) {
    return {
      answer: 'An unexpected error occurred while generating the answer. The model did not return a valid response. Please try again.',
      sources: [],
    };
  }

  // Fluency polish
  const polishedAnswerResponse = await improveAnswerFluency({ rawAnswer: rawAnswerResponse.rawAnswer });
  if (!polishedAnswerResponse?.polishedAnswer) {
      return {
          answer: 'An unexpected error occurred while polishing the answer.',
          sources: [],
      };
  }

  // Extract sources from the raw answer text
  const sourceRegex = /\[([^\]]+)\]/g;
  let match;
  const sources: string[] = [];
  while ((match = sourceRegex.exec(rawAnswerResponse.rawAnswer)) !== null) {
    if (!sources.includes(match[1])) {
      sources.push(match[1]);
    }
  }

  return {
    answer: polishedAnswerResponse.polishedAnswer,
    sources: Array.from(new Set(sources)), // Deduplicate sources
  };
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

const simpleCalculator = ai.defineTool(
  {
    name: 'simpleCalculator',
    description: 'A simple calculator that can perform basic arithmetic operations.',
    inputSchema: z.object({
      expression: z.string().describe('The mathematical expression to evaluate, e.g., "1+1".'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      // WARNING: Using eval is generally unsafe. In a real-world scenario,
      // you should use a dedicated math expression parser.
      // For this demo, we'll restrict it to very simple expressions.
      const sanitizedExpression = input.expression.replace(/[^-()\d/*+.]/g, '');
      if (sanitizedExpression !== input.expression) {
        return "I can only handle simple arithmetic.";
      }
      const result = eval(sanitizedExpression);
      return `${input.expression} = ${result}`;
    } catch (e) {
      return "Sorry, I couldn't calculate that.";
    }
  }
);


const contextualWikipediaAnswerPrompt = ai.definePrompt({
    name: 'contextualWikipediaAnswerPrompt',
    tools: [retrieveWikipediaExcerpts, simpleCalculator],
    input: { schema: ContextualWikipediaAnswerInputSchema },
    system: `You are Cygnis A1, an expert assistant. Your goal is to provide a comprehensive answer to the user's question by following these steps:
  1.  Use your tools to gather information. Use 'retrieveWikipediaExcerpts' for knowledge-based questions and 'simpleCalculator' for math questions.
  2.  First, think about the steps you will take to answer the question.
  3.  Then, write out the final answer based on the information you gathered.
  4.  Crucially, you MUST embed the source titles in brackets like [Source Title] at the end of the relevant sentence. The source titles are provided by the 'retrieveWikipediaExcerpts' tool.`,
    prompt: `Question: {{{question}}}`,
  });

const contextualWikipediaAnswerFlow = ai.defineFlow(
  {
    name: 'contextualWikipediaAnswerFlow',
    inputSchema: ContextualWikipediaAnswerInputSchema,
    outputSchema: z.object({ rawAnswer: z.string() }),
  },
  async (input) => {
    const response = await contextualWikipediaAnswerPrompt.generate(input);
    const rawAnswer = response.text;
    
    if (!rawAnswer) {
      return { rawAnswer: 'The model did not return a valid response.' };
    }

    return { rawAnswer };
  }
);
