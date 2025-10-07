import { NextResponse } from 'next/server';
import {
  contextualWikipediaAnswer,
  type ContextualWikipediaAnswerOutput,
} from '@/ai/flows/contextual-wikipedia-answer';
import { improveAnswerFluency } from '@/ai/flows/improve-answer-fluency';
import { getApiKeys } from '@/app/actions';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const body = await request.json();
  const { question } = body;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid API key' },
      { status: 401 }
    );
  }

  const apiKey = authHeader.split(' ')[1];
  const validKeys = await getApiKeys();
  const isKeyValid = validKeys.some((k) => k.key === apiKey);

  if (!isKeyValid) {
    return NextResponse.json(
      { error: 'Forbidden: Invalid API key' },
      { status: 403 }
    );
  }

  if (!question || typeof question !== 'string') {
    return NextResponse.json(
      { error: 'Bad Request: "question" is required and must be a string' },
      { status: 400 }
    );
  }

  try {
    const contextualAnswer = await contextualWikipediaAnswer({ question });
    if (!contextualAnswer.answer) {
      throw new Error('Failed to get a contextual answer.');
    }

    const polishedResult = await improveAnswerFluency({
      rawAnswer: contextualAnswer.answer,
    });

    return NextResponse.json({
      answer: polishedResult.polishedAnswer,
      sources: contextualAnswer.sources,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
