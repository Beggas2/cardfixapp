import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { MainApp } from './components/MainApp';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, isLoading, login, loginAnonymous, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center">
        <BrainCircuit className="h-16 w-16 text-cyan-400 mb-4" />
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={login} onLoginAnonymous={loginAnonymous} />;
  }

  return <MainApp user={user} onLogout={logout} />;
}
