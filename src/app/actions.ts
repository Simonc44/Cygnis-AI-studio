'use server';

import { z } from 'zod';
import {
  contextualWikipediaAnswer,
  type ContextualWikipediaAnswerOutput,
} from '@/ai/flows/contextual-wikipedia-answer';
import { revalidatePath } from 'next/cache';

const askSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
});

export type AskFormState = {
  question: string;
  answer: string;
  sources: ContextualWikipediaAnswerOutput['sources'];
  error: string | null;
};

export async function askAIAction(
  prevState: AskFormState,
  formData: FormData
): Promise<AskFormState> {
  const validatedFields = askSchema.safeParse({
    question: formData.get('question'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error:
        validatedFields.error.flatten().fieldErrors.question?.[0] ||
        'Invalid input.',
    };
  }

  const question = validatedFields.data.question;

  try {
    const result = await contextualWikipediaAnswer({ question });

    if (!result.answer) {
      throw new Error('Failed to get a contextual answer.');
    }

    return {
      question,
      answer: result.answer,
      sources: result.sources,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      question,
      answer: '',
      sources: [],
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

// In-memory store for mock API keys. In a real app, use a database.
const mockApiKeys: { id: string; key: string; createdAt: Date }[] = [
  {
    id: '1',
    key: `cgn_live_stable_demo_api_key_012345`,
    createdAt: new Date('2024-01-01'),
  },
];

export async function getApiKeys() {
  // In a real app, you'd fetch this from a database.
  // We'll simulate a delay to mimic a network request.
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockApiKeys;
}

export async function generateApiKeyAction() {
  try {
    const newKey = {
      id: (mockApiKeys.length + 2).toString(), // Ensure unique ID
      key: `cgn_live_stable_${Math.random().toString(36).substr(2, 10)}`,
      createdAt: new Date(),
    };
    mockApiKeys.push(newKey);
    revalidatePath('/api-keys');
    return { success: true, newKey };
  } catch (error) {
    return { success: false, error: 'Failed to generate API key.' };
  }
}

export async function revokeApiKeyAction(id: string) {
  try {
    const index = mockApiKeys.findIndex((key) => key.id === id);
    if (index > 0) { // Do not allow revoking the default key
      mockApiKeys.splice(index, 1);
    }
    revalidatePath('/api-keys');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to revoke API key.' };
  }
}
