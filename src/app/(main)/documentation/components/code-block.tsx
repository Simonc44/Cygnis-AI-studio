'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  curl: string;
  javascript: string;
  python: string;
}

export default function CodeBlock({
  curl,
  javascript,
  python,
}: CodeBlockProps) {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <Tabs defaultValue="curl" className="mt-2 w-full">
      <TabsList>
        <TabsTrigger value="curl">cURL</TabsTrigger>
        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
        <TabsTrigger value="python">Python</TabsTrigger>
      </TabsList>
      <div className="relative">
        <TabsContent value="curl">
          <pre className="w-full overflow-auto rounded-md bg-secondary p-4 pr-12">
            <code className="font-mono text-sm">{curl}</code>
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => handleCopy(curl)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TabsContent>
        <TabsContent value="javascript">
          <pre className="w-full overflow-auto rounded-md bg-secondary p-4 pr-12">
            <code className="font-mono text-sm">{javascript}</code>
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => handleCopy(javascript)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TabsContent>
        <TabsContent value="python">
          <pre className="w-full overflow-auto rounded-md bg-secondary p-4 pr-12">
            <code className="font-mono text-sm">{python}</code>
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => handleCopy(python)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TabsContent>
      </div>
    </Tabs>
  );
}
