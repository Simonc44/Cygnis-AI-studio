'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { askAIAction, type AskFormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, FileText, Loader2, Send, Sparkles, User, AlertCircle, Copy, BrainCircuit, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CygnisAILogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const initialState: AskFormState = {
  question: '',
  answer: '',
  sources: [],
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="icon"
      className="rounded-full w-10 h-10"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      <span className="sr-only">Send</span>
    </Button>
  );
}

function Question({ question }: { question: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <User className="size-5" />
      </div>
      <div className="flex-1 space-y-2 rounded-xl bg-secondary p-4 text-secondary-foreground">
        <p className="whitespace-pre-wrap text-base leading-relaxed">
          {question}
        </p>
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copié !',
      description: 'Le code a été copié dans le presse-papiers.',
    });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative rounded-md bg-secondary/50 my-4">
      <pre className="p-4 pr-12 text-sm overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copier le code</span>
      </Button>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const renderContent = () => {
    const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.replace(/```(python|javascript|typescript|html|css)?\n/, '').replace(/```$/, '');
        return <CodeBlock key={index} code={code} />;
      }

      // Replace **text** or *text* with <strong>text</strong>
      const bolded = part.replace(/\*{1,2}(.*?)\*{1,2}/g, '<strong>$1</strong>');
      
      // Split by newlines and wrap each line in a paragraph or handle as a list
      return bolded.split('\n').map((line, lineIndex) => {
        if (line.trim().startsWith('- ') || /^\d+\.\s/.test(line.trim())) {
          return (
            <p
              key={`${index}-${lineIndex}`}
              className="whitespace-pre-wrap text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: line }}
            />
          );
        }
        return (
          <p
            key={`${index}-${lineIndex}`}
            className="whitespace-pre-wrap text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line || ' ' }}
          />
        );
      });
    });
  };

  return <>{renderContent()}</>;
}


function Answer({
  answer,
  sources,
}: {
  answer: string;
  sources: string[];
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Sparkles className="size-5" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
           <MarkdownContent content={answer} />
        </div>
        {sources && sources.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-md font-semibold text-muted-foreground">
              <FileText className="size-4" /> Sources
            </h3>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary"
                >
                  {source}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
    return (
      <div className="flex items-start gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div className="flex-1 space-y-2 rounded-xl border bg-card p-4 text-card-foreground">
            <div className="flex items-center space-x-2 animate-pulse">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <div className="h-2 w-2 bg-primary rounded-full"></div>
            </div>
        </div>
      </div>
    )
}

function Welcome() {
    return (
        <div className="text-center p-8">
            <CygnisAILogo className="mx-auto size-16 mb-4 text-primary" />
            <h1 className="font-headline text-4xl font-bold mb-2">Cygnis AI Studio</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                Choisissez un modèle ci-dessous et posez une question pour commencer.
            </p>
        </div>
    )
}

export default function PlaygroundPage() {
  const [state, formAction] = useActionState(askAIAction, initialState);
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedModel, setSelectedModel] = useState('A1');

  useEffect(() => {
    if (!formRef.current) return;

    const defaultQuestion = 'Who discovered penicillin?';
    const questionTextarea = formRef.current.elements.namedItem(
      'question'
    ) as HTMLTextAreaElement | null;
    if (questionTextarea && !state.question) {
      questionTextarea.value = defaultQuestion;
      handleInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pending && formRef.current) {
      const currentQuestion = (formRef.current.elements.namedItem('question') as HTMLTextAreaElement)?.value;
      formRef.current.reset();
      if (textareaRef.current) {
          textareaRef.current.value = currentQuestion;
      }
      handleInput();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const handleInput = () => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && formRef.current) {
      e.preventDefault();
      const submitButton = formRef.current.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLElement) {
          submitButton.click();
      }
    }
  };

  return (
    <TooltipProvider>
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {!state.question && !pending && <Welcome />}

          {state.question && <Question question={state.question} />}

          {pending && <LoadingState />}

          {state.error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>An Error Occurred</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state.answer && !state.error && !pending && (
            <Answer answer={state.answer} sources={state.sources} />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 pb-4 pt-2 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <form
            ref={formRef}
            action={formAction}
          >
            <div className="mb-2 px-2">
                <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="flex justify-center gap-4">
                  <Label htmlFor="cygnis-a1" className="flex items-center gap-3 cursor-pointer rounded-full border px-4 py-2 has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50 transition-colors">
                    <RadioGroupItem value="A1" id="cygnis-a1" />
                    <BrainCircuit className="size-5 text-primary" />
                    <span className="font-medium">Cygnis A1</span>
                  </Label>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="cygnis-a2" className="flex items-center gap-3 cursor-not-allowed rounded-full border px-4 py-2 opacity-50">
                        <RadioGroupItem value="A2" id="cygnis-a2" disabled />
                        <Rocket className="size-5 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Cygnis A2</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cygnis A2 est un modèle local non disponible dans cette démo.</p>
                    </TooltipContent>
                  </Tooltip>

                </RadioGroup>
                <input type="hidden" name="modelId" value={selectedModel} />
            </div>

            <Card className="overflow-hidden shadow-lg bg-white">
              <CardContent className="p-2">
                <div
                  className="flex w-full items-end gap-2"
                >
                  <Textarea
                    ref={textareaRef}
                    name="question"
                    placeholder="Ask anything..."
                    className="max-h-48 flex-1 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
                    required
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  <SubmitButton />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
