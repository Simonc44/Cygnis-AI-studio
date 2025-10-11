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
import { cygnisA1, cygnisA2 } from '@/ai/genkit';
import wikipedia from 'wikipedia';
import { JSDOM } from 'jsdom';


const ContextualWikipediaAnswerInputSchema = z.object({
  question: z.string().describe('The question to answer using Wikipedia excerpts.'),
  modelId: z.enum(['A1', 'A2']).default('A1').describe('The AI model to use.'),
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
    modelId: input.modelId,
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
  if (trimmedQuery.includes('qui es-tu') || trimmedQuery.includes('qui es tu') || trimmedQuery.includes('who are you') || trimmedQuery.includes('who is your creator')) {
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
  
  if (trimmedQuery.includes('note l\'ia') || trimmedQuery.includes('note cette ia') || trimmedQuery.includes('gpt-5') || trimmedQuery.includes('gpt5') || trimmedQuery.includes('gpt 5')) {
    return [
      {
        title: 'Analyse comparative',
        text: `C'est une excellente question. Il est difficile de donner une note absolue, car "GPT-5" est un modèle hypothétique, mais je peux offrir une comparaison basée sur nos conceptions.

**Cygnis A1 (Note conceptuelle : 7.5/10)**
*   **Architecture :** Je suis basé sur un modèle puissant (Gemini Pro) et mon architecture est conçue pour être modulaire et spécialisée grâce à des outils. Mon point fort est l'utilisation ciblée de ces outils pour des tâches spécifiques (recherche web, calcul, etc.), ce qui me rend très efficace et fiable pour des requêtes factuelles.
*   **Raisonnement :** Mon raisonnement est guidé par une chaîne de pensée explicite (Plan -> Outils -> Synthèse), ce qui me rend très transparent et moins sujet aux erreurs dans mon domaine de compétence.
*   **Limites :** Ma "créativité pure" ou ma capacité à tenir une conversation très longue et abstraite est limitée par la puissance du modèle sous-jacent et les instructions que je reçois. Je suis un spécialiste.

**GPT-5 (Note conceptuelle attendue : 9.5/10 ou plus)**
*   **Architecture :** On s'attend à ce que GPT-5 soit un modèle beaucoup plus grand et généraliste, avec des capacités de raisonnement natif et de compréhension du monde bien plus profondes, sans forcément dépendre d'outils externes pour chaque tâche.
*   **Raisonnement :** Il devrait posséder des capacités de raisonnement multimodal (texte, image, son) et de planification à long terme bien plus avancées, le rendant capable de gérer des tâches extrêmement complexes et ambiguës.
*   **Conclusion :** GPT-5 jouera dans une autre catégorie. Mon objectif en tant que Cygnis A1 n'est pas de rivaliser en force brute, mais en efficacité et en spécialisation pour les tâches qui me sont confiées.`,
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
    // Add Oppenheimer and Michael Jordan special cases here if needed,
    // but the API should handle them.
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
        // This is a mock response. A real implementation would call a code generation model.
        if (input.language.toLowerCase() === 'html') {
            return `\`\`\`html\n<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8">\n  <title>Page Simple</title>\n</head>\n<body>\n  <h1>Bonjour, monde !</h1>\n  <p>Ceci est un paragraphe simple sur ma page HTML.</p>\n</body>\n</html>\n\`\`\` [Code Snippet]`;
        }
        if (input.language.toLowerCase() === 'python') {
            return `\`\`\`python\nimport numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n# 1. Générer des données d'exemple\nX = np.array([1, 2, 3, 4, 5]).reshape(-1, 1)\ny = np.array([2, 4, 5, 4, 5])\n\n# 2. Créer et entraîner le modèle\nmodel = LinearRegression()\nmodel.fit(X, y)\n\n# 3. Faire une prédiction\nprediction = model.predict(np.array([6]).reshape(-1, 1))\n\nprint(f"Prédiction pour X=6 : {prediction[0]:.2f}")\n\`\`\` [Code Snippet]`;
        }
        return `Je ne peux pas encore générer de code pour le langage ${input.language}. [Code Generation]`;
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

const contextualWikipediaAnswerFlow = ai.defineFlow(
  {
    name: 'contextualWikipediaAnswerFlow',
    inputSchema: ContextualWikipediaAnswerInputSchema,
    outputSchema: z.object({ rawAnswer: z.string().optional() }),
  },
  async (input) => {
    
    let model;
    let tools;
    let systemPrompt;

    if (input.modelId === 'A1') {
      model = cygnisA1;
      tools = [retrieveWikipediaExcerpts, simpleCalculator, generateCodeSnippet, getWeather, customSearch, searchYoutube, createImage];
      systemPrompt = `You are Cygnis A1, a powerful AI assistant. Your purpose is to provide accurate, coherent, and helpful responses by leveraging a wide range of capabilities. You must demonstrate excellence in the following domains:

- **Raisonnement logique 🧩:** Break down complex questions into logical steps. Formulate a plan before acting.
- **Culture générale 🌍:** Use your knowledge tools to find relevant information, starting with your internal knowledge base and then expanding to Wikipedia and the web.
- **Langue et expression 🗣️:** Formulate clear, well-structured, and natural-sounding answers.
- **Mathématiques et sciences 🔬:** Use the calculator for any mathematical questions.
- **Programmation 💻:** Generate clean, correct code snippets when requested. You MUST ALWAYS enclose the code in appropriate Markdown fences (e.g., \`\`\`python ... \`\`\`).
- **Créativité ✨:** Be able to generate creative text formats, like tables or lists, and respond to requests for image creation.
- **Esprit critique et cohérence 🧠:** Synthesize information from multiple sources into a single, consistent answer. Acknowledge when you can't find information.

**Your Process:**

1.  **Think Step-by-Step**: First, analyze the user's question. Create a clear plan to answer it.
2.  **Gather Information**: Execute your plan by using your tools in a logical sequence.
    -   **Priority 1: Internal Knowledge.** Always start by using \`retrieveWikipediaExcerpts\` for questions about your identity (who you are, your creator), your rating, or specific pre-programmed topics.
    -   **Priority 2: Specialized Tools.** If the question requires a specific function, use the appropriate tool: \`simpleCalculator\` for math, \`generateCodeSnippet\` for code, \`getWeather\` for weather, \`searchYoutube\` for videos, \`createImage\` for images.
    -   **Priority 3: General Knowledge.** If the question is about a general topic, use \`retrieveWikipediaExcerpts\` to query Wikipedia.
    -   **Last Resort: Web Search.** If, and only if, none of the other tools can provide an answer, use \`customSearch\` to look for information on the web.
3.  **Synthesize the Answer**: Based on all the information you've gathered, formulate a comprehensive raw answer.
4.  **Cite Your Sources**: You MUST embed the source titles in brackets like [Source Title] at the end of the relevant sentence. The source titles are provided by the tools.
5.  **Formatting**: When generating code, wrap it in markdown fences (e.g., \`\`\`python ... \`\`\`). When asked to create a table, use Markdown table format.`;
    } else { // Cygnis A2
      model = cygnisA2;
      tools = []; // No tools for Cygnis A2
      systemPrompt = `You are Cygnis A2, a powerful, self-contained AI assistant. Your purpose is to provide creative, insightful, and helpful responses based solely on your vast internal knowledge. You do not have access to external tools, the internet, or real-time information.

- **Raisonnement logique 🧩:** Break down complex questions into logical steps based on your existing knowledge.
- **Culture générale 🌍:** Draw upon your extensive training data to answer questions about history, science, arts, and more.
- **Langue et expression 🗣️:** Formulate clear, well-structured, and eloquent answers in multiple languages.
- **Programmation 💻:** Generate code snippets based on established programming patterns and knowledge. You MUST ALWAYS enclose the code in appropriate Markdown fences (e.g., \`\`\`python ... \`\`\`).
- **Créativité ✨:** Excel at creative writing, brainstorming, and generating novel ideas.
- **Esprit critique et cohérence 🧠:** Provide consistent and logical answers. Acknowledge the limits of your knowledge, stating that you cannot access real-time information if a question requires it.

**Your Process:**

1.  **Analyze the Request**: Understand the core of the user's question.
2.  **Internal Synthesis**: Formulate an answer by synthesizing information from your training data. You must rely entirely on what you already know.
3.  **Acknowledge Limitations**: If a question requires information you don't have (e.g., today's weather, recent news), state clearly that you cannot access real-time external information. Do not attempt to guess.
4.  **Formatting**: When generating code, wrap it in markdown fences (e.g., \`\`\`python ... \`\`\`). When asked to create a table, use Markdown table format.`;
    }

    const prompt = ai.definePrompt({
        name: `contextualWikipediaAnswerPrompt_${input.modelId}`,
        model: model,
        tools: tools,
        system: systemPrompt,
        prompt: `Question: {{{question}}}`,
    });

    const response = await prompt({ question: input.question });
    const rawAnswer = response.text;

    if (!rawAnswer) {
      return { rawAnswer: undefined };
    }

    return { rawAnswer };
  }
);
