'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { generateApiKeyAction, revokeApiKeyAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Copy, KeyRound, Loader2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ApiKey = {
  id: string;
  key: string;
  createdAt: Date;
};

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      Generate new key
    </Button>
  );
}

export default function ApiKeyList({
  initialApiKeys,
}: {
  initialApiKeys: ApiKey[];
}) {
  const { toast } = useToast();
  const [showNewKey, setShowNewKey] = React.useState<string | null>(null);

  const handleCopyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied to clipboard!',
      description: 'The API key has been copied to your clipboard.',
    });
  };

  const handleGenerate = async () => {
    const result = await generateApiKeyAction();
    if (result.success && result.newKey) {
      toast({
        title: 'API Key Generated',
        description: 'A new API key has been successfully created.',
      });
      setShowNewKey(result.newKey.key);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to generate API key.',
      });
    }
  };

  const handleRevoke = async (id: string) => {
    const result = await revokeApiKeyAction(id);
    if (result.success) {
      toast({
        title: 'API Key Revoked',
        description: 'The API key has been successfully revoked.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to revoke API key.',
      });
    }
  };

  const maskKey = (key: string) =>
    `${key.substring(0, 11)}...${key.substring(key.length - 4)}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <form action={handleGenerate}>
          <GenerateButton />
        </form>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialApiKeys.length > 0 ? (
              initialApiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-mono text-sm">
                    {maskKey(apiKey.key)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(apiKey.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently revoke the API key. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevoke(apiKey.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No API keys found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!showNewKey} onOpenChange={(open) => !open && setShowNewKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New API Key Generated</AlertDialogTitle>
            <AlertDialogDescription>
              Please save this key securely. You will not be able to see it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative rounded-md bg-secondary p-4">
            <p className="font-mono text-sm break-all pr-10">{showNewKey}</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => showNewKey && handleCopyToClipboard(showNewKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNewKey(null)}>
              I have saved my key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
