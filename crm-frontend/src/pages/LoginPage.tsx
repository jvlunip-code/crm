import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth, useLogin } from '@/hooks/use-auth';
import { BrandMark } from '@/components/layout/BrandMark';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const login = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (authLoading) {
    return (
      <div role="status" className="flex min-h-svh items-center justify-center bg-background">
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
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <div className="flex items-center gap-2.5">
        <BrandMark />
        <span className="type-heading text-foreground">JVL</span>
      </div>

      <div className="flex w-full max-w-95 flex-col gap-6 rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="type-title text-foreground">Iniciar sessão</h1>
          <p className="type-lead text-muted-foreground">Gestão de clientes JVL Comunicações</p>
        </div>

        {login.isError && (
          <p
            role="alert"
            className="rounded-md bg-status-error-bg px-3 py-2.5 type-body text-status-error-fg"
          >
            {login.error.message || 'Credenciais inválidas'}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Utilizador</FieldLabel>
              <Input
                id="username"
                size="lg"
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
                size="lg"
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
    </main>
  );
}
