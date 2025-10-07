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
