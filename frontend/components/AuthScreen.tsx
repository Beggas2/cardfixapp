import React, { useState } from 'react';
import { BrainCircuit, Loader2, UploadCloud, FileCheck2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onLoginAnonymous: () => Promise<{ success: boolean; error?: string }>;
}

export function AuthScreen({ onLogin, onLoginAnonymous }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'register') {
        // First create the user
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        // Then login
        const result = await onLogin(email, password);
        if (!result.success) {
          setError(result.error || 'Login after registration failed');
        }
      } else {
        // Just login
        const result = await onLogin(email, password);
        if (!result.success) {
          setError(result.error || 'Authentication failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await onLoginAnonymous();
      if (!result.success) {
        setError(result.error || 'Guest login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center">
            <BrainCircuit className="h-10 w-10 mr-3 text-cyan-400" />
            CardFix
          </h1>
          <p className="text-slate-400 mt-2">Seu assistente de estudos com IA.</p>
        </header>

        <div className="bg-slate-800/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex border-b border-slate-700 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-3 font-semibold text-center transition-colors ${
                authMode === 'login' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-3 font-semibold text-center transition-colors ${
                authMode === 'register' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-white text-xl font-bold text-center">
              {authMode === 'login' ? 'Acessar Conta' : 'Criar Conta'}
            </h2>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            {authMode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Nome (opcional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 transition-all text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                authMode === 'login' ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-800/50 px-2 text-slate-400">OU</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 transition-all text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              'Continuar como Convidado'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
