import { NextResponse } from 'next/server';
import {
  contextualWikipediaAnswer,
} from '@/ai/flows/contextual-wikipedia-answer';

const API_KEY = process.env.CYGNIS_API_KEY;

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

  if (apiKey !== API_KEY) {
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
    const contextualAnswer = await contextualWikipediaAnswer({ question, modelId: 'A1' });

    return NextResponse.json({
      answer: contextualAnswer.answer,
      sources: contextualAnswer.sources,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
