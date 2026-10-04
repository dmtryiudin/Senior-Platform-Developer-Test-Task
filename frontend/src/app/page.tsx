'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError, apiFetch } from '@/lib/api';

// Terminus health response (only the fields used here).
type Health = {
  status: string;
  info?: { database?: { status: string } };
};

async function fetchHealth(): Promise<string> {
  try {
    const health = await apiFetch<Health>('/api/health');
    return `api: ${health.status}, db: ${health.info?.database?.status ?? 'unknown'}`;
  } catch (error) {
    return error instanceof ApiError
      ? `error ${error.status}: ${error.message}`
      : 'unreachable';
  }
}

export default function Home() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    // fetchHealth never rejects, so the promise is safe to leave unawaited.
    void fetchHealth().then(setStatus);
  }, []);

  const recheck = () => {
    setStatus('checking...');
    void fetchHealth().then(setStatus);
  };

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Test Task</h1>
      <p className="text-muted-foreground">Backend status: {status}</p>
      <Button className="self-start" onClick={recheck}>
        Check again
      </Button>
    </main>
  );
}
