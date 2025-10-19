import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CodeBlock from './components/code-block';
import { Badge } from '@/components/ui/badge';

const API_KEY = "cgn_live_stable_demo_api_key_012345";

const curlExample = `curl -X POST https://cygnis-ai-studio.vercel.app/api/ask \\
  -H "Authorization: Bearer ${API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Who discovered penicillin?"}'`;

const jsExample = `fetch('https://cygnis-ai-studio.vercel.app/api/ask', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${API_KEY}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'Who discovered penicillin?',
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;

const pythonExample = `import requests

api_url = "https://cygnis-ai-studio.vercel.app/api/ask"
api_key = "${API_KEY}"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = {
    "question": "Who discovered penicillin?"
}

response = requests.post(api_url, headers=headers, json=data)

if response.status_code == 200:
    print(response.json())
else:
    print(f"Error: {response.status_code}", response.text)`;

const responseExample = `{
  "answer": "The discovery of penicillin is attributed to Scottish scientist Alexander Fleming in 1928.",
  "sources": [
    "History of penicillin",
    "Alexander Fleming"
  ]
}`;

export default function DocumentationPage() {
  return (
    <div className="p-4 md:p-6 space-y-8 overflow-auto h-full">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Introduction</CardTitle>
          <CardDescription>
            Welcome to the Cygnis AI Studio API. Use our powerful RAG model to answer
            questions with contextual knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            The API provides a simple interface to our AI model, Cygnis A1. All you need to do is
            send a question, and we'll return a polished, context-aware
            answer along with its sources.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Authentication
          </CardTitle>
          <CardDescription>
            Authenticate your API requests by providing your API key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            All API requests must be authenticated with an API key. For this demo,
            please use the static key provided below. There is no page to generate new keys; this key is for all users of this demonstration application.
          </p>
          <p>
            Include your API key in the `Authorization` header with the `Bearer`
            scheme.
          </p>
          <pre className="mt-2 rounded-md bg-secondary p-4 text-sm">
            <code>Authorization: Bearer ${API_KEY}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">POST</Badge>
              <p className="font-mono text-lg">/api/ask</p>
            </div>
            <p className="mt-2 text-muted-foreground">
              Ask a question to the Cygnis A1 model.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Request Body (JSON)</h4>
            <div className="mt-2 w-full overflow-hidden rounded-md border">
              <div className="p-4">
                <code className="font-mono text-sm">
                  {`{ "question": "string" }`}
                </code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Example Request</h4>
            <CodeBlock
              curl={curlExample}
              javascript={jsExample}
              python={pythonExample}
            />
          </div>
          <div>
            <h4 className="font-semibold">Example Response (200 OK)</h4>
            <pre className="mt-2 w-full overflow-hidden rounded-md bg-secondary p-4">
              <code className="font-mono text-sm">{responseExample}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
