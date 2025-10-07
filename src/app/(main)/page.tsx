'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { askAIAction, type AskFormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Bot, User, FileText, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

const initialState: AskFormState = {
  question: '',
  answer: '',
  sources: [],
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Ask Cygnis
    </Button>
  );
}

export default function PlaygroundPage() {
  const [state, formAction] = useActionState(askAIAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!formRef.current) return;
    
    const defaultQuestion = "Who discovered penicillin?";
    const questionTextarea = formRef.current.elements.namedItem("question") as HTMLTextAreaElement | null;
    if (questionTextarea) {
      questionTextarea.value = defaultQuestion;
    }
  }, []);

  return (
    <div className="flex h-full flex-col gap-8">
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-2xl">
            <User /> Your Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="flex flex-col gap-4">
            <Textarea
              name="question"
              placeholder="e.g., Who discovered penicillin?"
              className="min-h-[100px] text-base"
              required
            />
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      {(state.answer || state.error) && (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-2xl">
              <Bot /> Cygnis A1&apos;s Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {state.answer}
                </p>
                {state.sources && state.sources.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                      <FileText className="size-5" /> Sources
                    </h3>
                    <div className="space-y-2">
                      {state.sources.map((source, index) => (
                        <div
                          key={index}
                          className="rounded-md border bg-secondary/50 p-3 text-sm"
                        >
                          <p className="text-muted-foreground">{source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
