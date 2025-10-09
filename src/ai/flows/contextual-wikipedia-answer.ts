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
import wikipedia from 'wikipedia';
import { JSDOM } from 'jsdom';


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
  description: 'Retrieves relevant excerpts from internal knowledge base or Wikipedia.',
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
  // Internal knowledge overrides Wikipedia
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
  
  try {
    // Real Wikipedia API call
    const searchResults = await wikipedia.search(trimmedQuery);
    if (!searchResults.results.length) {
      return [];
    }
    const page = await wikipedia.page(searchResults.results[0].title);
    const summary = await page.summary();
    return [{
      title: summary.title,
      text: summary.extract,
    }];
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return []; // Return empty if Wikipedia fails
  }
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
        description: 'Searches the web for a query and reads the content of the most relevant page. Use this as a last resort if no other tool provides an answer.',
        inputSchema: z.object({
            query: z.string().describe('The query to search on the web.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        try {
            // This tool will now perform a real web search and scrape the top result.
            // Note: This is a simplified implementation. A robust version would handle more complex sites.
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(input.query)}`;

            // We need to pretend to be a browser to avoid getting blocked.
            const searchResponse = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!searchResponse.ok) {
                return `Failed to perform web search. [Web Search Error]`;
            }

            const searchHtml = await searchResponse.text();
            const searchDom = new JSDOM(searchHtml);
            // Find the first organic search result link.
            const firstLink = searchDom.window.document.querySelector('div.g a');
            
            if (!firstLink || !firstLink.href) {
                return `No web results found for "${input.query}". [Web Search]`;
            }

            const pageUrl = firstLink.href;

            // Now fetch and parse the content of the page.
            const pageResponse = await fetch(pageUrl);
            if (!pageResponse.ok) {
                return `Could not access the page at ${pageUrl}. [Web Scraper]`;
            }

            const pageHtml = await pageResponse.text();
            const pageDom = new JSDOM(pageHtml);
            
            // Remove script and style elements
            pageDom.window.document.querySelectorAll('script, style').forEach(el => el.remove());
            
            // Get text from the body, replacing multiple newlines/spaces
            let text = pageDom.window.document.body.textContent || "";
            text = text.replace(/\s\s+/g, ' ').trim();

            if (!text) {
                return `The page at ${pageUrl} had no readable content. [Web Scraper]`;
            }

            // Return a snippet of the text
            return `Content from ${pageUrl}: ${text.substring(0, 2000)}... [${new URL(pageUrl).hostname}]`;

        } catch (error) {
            console.error('Web search/scrape error:', error);
            return `An error occurred while searching the web. [Web Search Error]`;
        }
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
    - Start by using 'retrieveWikipediaExcerpts' for questions about your identity or general knowledge that might be in your internal knowledge base or on Wikipedia.
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
