import { getApiKeys } from '@/app/actions';
import ApiKeyList from './components/api-key-list';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ApiKeysPage() {
  const apiKeys = await getApiKeys();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for accessing the Cygnis A1 API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyList initialApiKeys={apiKeys} />
        </CardContent>
      </Card>
    </div>
  );
}
