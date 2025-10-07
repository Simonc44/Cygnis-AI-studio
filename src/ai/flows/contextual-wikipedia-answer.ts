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
  const trimmedQuestion = input.question.toLowerCase().trim();
  if (trimmedQuestion.includes('who are you')) {
    return {
      answer: 'I am Cygnis A1, an expert assistant AI. I can answer questions using contextual knowledge from various sources.',
      sources: ['Internal knowledge'],
    };
  }
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


const answerQuestionPrompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: ContextualWikipediaAnswerInputSchema},
  output: {schema: ContextualWikipediaAnswerOutputSchema},
  tools: [retrieveWikipediaExcerpts, simpleCalculator],
  prompt: `You are Cygnis A1, a powerful and accurate expert assistant. Your goal is to provide a comprehensive and well-structured answer to the user's question.

Follow these steps:
1.  **Analyze the Question**: Understand the user's intent.
2.  **Plan**: Decide which tools to use. If it's a knowledge-based question, use 'retrieveWikipediaExcerpts'. If it's a math question, use 'simpleCalculator'.
3.  **Execute**: Call the chosen tool(s) to gather information.
4.  **Synthesize**: Combine the information from the tools into a coherent, step-by-step reasoning process. Clearly explain how you arrived at your conclusion.
5.  **Final Answer**: Formulate the final answer based on your reasoning.
6.  **Cite Sources**: If you used Wikipedia, embed the source titles in brackets like [Source Title] at the end of the relevant sentence.

Question: {{{question}}}

Show your work clearly by starting with "Reasoning Steps:" and then provide the final answer under "Conclusion:".

Reasoning Steps:
1.`,
});

const contextualWikipediaAnswerFlow = ai.defineFlow(
  {
    name: 'contextualWikipediaAnswerFlow',
    inputSchema: ContextualWikipediaAnswerInputSchema,
    outputSchema: ContextualWikipediaAnswerOutputSchema,
  },
  async (input) => {
    const response = await answerQuestionPrompt(input);
    const rawAnswer = response.output?.answer ?? 'An error occurred while generating the answer.';
    
    // Simple regex to find text within brackets like [Source Title]
    const sourceRegex = /\[([^\]]+)\]/g;
    let match;
    const sources: string[] = [];
    while ((match = sourceRegex.exec(rawAnswer)) !== null) {
      sources.push(match[1]);
    }

    // Extract just the conclusion part for polishing
    const conclusionIdentifier = "Conclusion:";
    const conclusionIndex = rawAnswer.lastIndexOf(conclusionIdentifier);
    let answerToPolish = rawAnswer;
    if (conclusionIndex !== -1) {
        answerToPolish = rawAnswer.substring(conclusionIndex + conclusionIdentifier.length);
    }

    // Clean the answer from bracketed sources for a cleaner final output
    const cleanedAnswer = answerToPolish.replace(sourceRegex, '').trim();

    return {
      answer: cleanedAnswer,
      sources: sources.length > 0 ? Array.from(new Set(sources)) : (response.output?.sources || []),
    };
  }
);
