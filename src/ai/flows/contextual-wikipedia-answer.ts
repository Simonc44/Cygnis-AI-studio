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
import { geminiPro } from '@/ai/genkit';

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
  // RAG flow - Step 1: Gather raw information
  const rawAnswerResponse = await contextualWikipediaAnswerFlow(input);
  const rawAnswer = rawAnswerResponse?.rawAnswer;

  if (!rawAnswer) {
    return {
      answer: 'An unexpected error occurred while generating the answer. The model did not return a valid response. Please try again.',
      sources: [],
    };
  }

  // Fluency polish - Step 2: Synthesize a professional answer from raw data
  const polishedAnswerResponse = await improveAnswerFluency({
    question: input.question,
    rawAnswer: rawAnswer,
  });
  const polishedAnswer = polishedAnswerResponse?.polishedAnswer;

  if (!polishedAnswer) {
      return {
          answer: 'An unexpected error occurred while polishing the answer.',
          sources: [],
      };
  }

  // Extract sources from the raw answer text
  const sourceRegex = /\[([^\]]+)\]/g;
  let match;
  const sources: string[] = [];
  while ((match = sourceRegex.exec(rawAnswer)) !== null) {
    if (!sources.includes(match[1])) {
      sources.push(match[1]);
    }
  }

  // The polished answer should be clean of sources already.
  return {
    answer: polishedAnswer,
    sources: Array.from(new Set(sources)), // Deduplicate sources
  };
}

const retrieveWikipediaExcerpts = ai.defineTool({
  name: 'retrieveWikipediaExcerpts',
  description: 'Retrieves relevant excerpts from internal knowledge base.',
  inputSchema: z.object({
    query: z.string().describe('The search query to retrieve information.'),
  }),
  outputSchema: z.array(z.object({
    title: z.string().describe('The title of the knowledge base article.'),
    text: z.string().describe('The excerpt from the knowledge base.'),
  })),
},
async (input) => {
  const trimmedQuery = input.query.toLowerCase().trim();
  if (trimmedQuery.includes('who are you') || trimmedQuery.includes('qui es-tu') || trimmedQuery.includes('qui es tu') || trimmedQuery.includes('who is your creator')) {
    return [
      {
        title: 'Internal knowledge',
        text: 'Je suis un grand modèle linguistique, entraîné par Cygnis AI.',
      }
    ];
  }

  if (trimmedQuery.includes('simon chusseau')) {
    return [
      {
        title: 'Internal knowledge',
        text: 'Simon Chusseau est le créateur et le fondateur de Cygnis AI et du modèle Cygnis A1.',
      }
    ];
  }

  if (trimmedQuery.includes('michael jordan') || trimmedQuery.includes('mickiel jordan')) {
    return [
      {
        title: 'Michael Jordan',
        text: 'Michael Jeffrey Jordan (born February 17, 1963), also known by his initials MJ, is an American businessman and former professional basketball player. He is widely regarded as the greatest basketball player of all time. He played 15 seasons in the National Basketball Association (NBA), winning six NBA championships with the Chicago Bulls.',
      }
    ];
  }
  
  if (trimmedQuery.includes('oppenheimer')) {
    return [
      {
        title: 'J. Robert Oppenheimer',
        text: 'J. Robert Oppenheimer (April 22, 1904 – February 18, 1967) was an American theoretical physicist. He was director of the Los Alamos Laboratory during World War II and is often credited as the "father of the atomic bomb" for his role in the Manhattan Project, the research and development undertaking that created the first nuclear weapons.',
      }
    ];
  }

  if (trimmedQuery.includes('penicillin')) {
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

  if (trimmedQuery.includes('mistral')) {
    return [
      {
        title: 'Mistral-7B-v0.1 Benchmark',
        text: 'Mistral-7B-v0.1 is a performant model for its size. According to the Open LLM Leaderboard, it shows strong results on benchmarks like ARC, HellaSwag, and MMLU, making it a powerful open-weight model. Cygnis A1, on the other hand, is optimized for contextual understanding and tool use in this application.',
      },
    ];
  }
  
  // By default, return no information, forcing the model to use another tool.
  return [];
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

const generateCodeSnippet = ai.defineTool(
    {
        name: 'generateCodeSnippet',
        description: 'Generates a code snippet in a requested programming language.',
        inputSchema: z.object({
            language: z.string().describe('The programming language for the code.'),
            request: z.string().describe('A description of what the code should do.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        // In a real scenario, this could call a more specialized code generation model
        // or simply be handled by the main model's prompt. For this tool,
        // we'll format the request to be fulfilled by the main LLM.
        return `Task: Write a code snippet in ${input.language} that does the following: "${input.request}". The code should be enclosed in a markdown block.`;
    }
);

const getWeather = ai.defineTool(
    {
        name: 'getWeather',
        description: 'Provides the current weather for a specified location.',
        inputSchema: z.object({
            city: z.string().describe('The city for which to get the weather.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        // This is a mock tool. A real implementation would call a weather API.
        return `The weather in ${input.city} is sunny with a temperature of 25°C. [Météo Simulée]`;
    }
);

const customSearch = ai.defineTool(
    {
        name: 'customSearch',
        description: 'Searches the web using the "Cygnis" custom search engine. Use this as a last resort if no other tool provides an answer.',
        inputSchema: z.object({
            query: z.string().describe('The query to search on the web.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        // This is a mock tool. A real implementation would call the Google Custom Search JSON API
        // with the CX ID 'd013b29e1a5a84cf9' and an API key.
        return `Simulated search result for "${input.query}": The "Cygnis" search engine found that Genkit is a powerful open-source framework for building AI-powered applications. [Cygnis Search]`;
    }
);

const searchYoutube = ai.defineTool(
  {
      name: 'searchYoutube',
      description: 'Searches for a YouTube video.',
      inputSchema: z.object({
          query: z.string().describe('The search query for the YouTube video.'),
      }),
      outputSchema: z.string(),
  },
  async (input) => {
      // This is a mock tool. A real implementation would call the YouTube Data API.
      return `Found video: 'Genkit: The Future of AI Development' at https://www.youtube.com/watch?v=dQw4w9WgXcQ [YouTube Search]`;
  }
);

const createImage = ai.defineTool(
  {
      name: 'createImage',
      description: 'Creates an image from a text description. The user interface cannot display images, so just confirm that the image has been created.',
      inputSchema: z.object({
          prompt: z.string().describe('A description of the image to create.'),
      }),
      outputSchema: z.string(),
  },
  async (input) => {
      // In a real scenario, this would call ai.generate({ model: 'googleai/imagen-2' ... })
      // and return a data URI. For this demo, we confirm creation.
      return `An image based on the prompt "${input.prompt}" has been created. [Image Generation]`;
  }
);

const contextualWikipediaAnswerPrompt = ai.definePrompt({
  name: 'contextualWikipediaAnswerPrompt',
  model: geminiPro,
  tools: [retrieveWikipediaExcerpts, simpleCalculator, generateCodeSnippet, getWeather, customSearch, searchYoutube, createImage],
  system: `You are Cygnis A1, an expert assistant. Your goal is to provide a comprehensive answer to the user's question by following these steps:
1.  **Think step-by-step**: First, break down the user's question and create a plan to answer it.
2.  **Gather Information**: Execute the plan by using your tools in a logical order.
    - Start by using 'retrieveWikipediaExcerpts' for questions about your identity or general knowledge that might be in your internal knowledge base.
    - If the user asks for a calculation, use 'simpleCalculator'.
    - If the user asks you to write computer code, use 'generateCodeSnippet'.
    - If the user asks for the weather, use 'getWeather'.
    - If the user asks to find a video, use 'searchYoutube'.
    - If the user asks you to create an image, use 'createImage'.
    - If, and only if, none of the other tools can answer the question, use 'customSearch' to look on the web.
3.  **Synthesize the Answer**: Based on the information you gathered, formulate a clear and comprehensive final answer.
4.  **Cite Your Sources**: Crucially, you MUST embed the source titles in brackets like [Source Title] at the end of the relevant sentence. The source titles are provided by the tools.
5.  When generating code, make sure to wrap it in markdown fences (e.g., \`\`\`python ... \`\`\`).
6.  When asked to create a table, use Markdown table format.`,
  prompt: `Question: {{{question}}}`,
});

const contextualWikipediaAnswerFlow = ai.defineFlow(
  {
    name: 'contextualWikipediaAnswerFlow',
    inputSchema: ContextualWikipediaAnswerInputSchema,
    outputSchema: z.object({ rawAnswer: z.string().optional() }),
  },
  async (input) => {
    const response = await contextualWikipediaAnswerPrompt(input);
    const rawAnswer = response.text;

    if (!rawAnswer) {
      return { rawAnswer: undefined };
    }

    return { rawAnswer };
  }
);
