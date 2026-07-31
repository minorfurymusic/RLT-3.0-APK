import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('health_login', 'true');
      onLoginSuccess();
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          {/* App Logo/Icon */}
          <div className="w-16 h-16 bg-blue-650 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Real Life Track</h1>
          <p className="text-sm text-slate-400 mt-1">Gerenciamento de rotina e saúde inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl py-3.5 px-5 text-white font-medium outline-none transition-all duration-200"
              placeholder="Digite o usuário"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl py-3.5 px-5 text-white font-medium outline-none transition-all duration-200"
              placeholder="Digite a senha"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/20 mt-4 cursor-pointer"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Versão 3.0 (Capacitor Native)
        </div>
      </div>
    </div>
  );
}
