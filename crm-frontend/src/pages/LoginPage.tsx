import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CircleDot } from 'lucide-react';
import { useAuth, useLogin } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { CornerMarkers } from '@/components/shared/EmptyState';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const login = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="type-body text-muted-foreground">A carregar…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ username, password }, { onSuccess: () => navigate('/') });
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background p-6">
      <div className="relative flex w-full max-w-[360px] flex-col items-center gap-5 border border-border bg-card px-6 py-8">
        <CornerMarkers />
        <div className="flex size-10 items-center justify-center rounded-sm bg-primary text-primary-foreground">
          <CircleDot className="size-5" aria-hidden />
        </div>
        <div className="flex flex-col gap-1 text-center">
          <h1 className="type-page-title text-foreground">Sistema CRM</h1>
          <p className="type-caption text-muted-foreground">Gestão de clientes</p>
        </div>
        {login.isError && (
          <p
            role="alert"
            className="w-full rounded-sm border border-status-error/40 bg-status-error/10 px-3 py-2 type-caption text-foreground"
          >
            {login.error.message || 'Credenciais inválidas'}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Utilizador</FieldLabel>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Palavra-passe</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          </FieldGroup>
          <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'A entrar…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
