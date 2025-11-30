import React, { useState } from 'react';
import { User } from '../types';
import { authenticateUser } from '../services/mockDatabase';
import { School, Lock, Mail, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = authenticateUser(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciales inválidas. Por favor intente nuevamente.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-800 p-4">
      <div className="w-full max-w-md">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full inline-block mb-4 border border-white/20">
             <School className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ISFDyT N° 26</h1>
          <p className="text-blue-200 text-sm uppercase tracking-wider">Instituto Superior de Formación Docente y Técnica</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white font-medium placeholder-gray-400"
                    placeholder="nombre@instituto.edu.ar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white font-medium placeholder-gray-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all"
              >
                {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    'Ingresar'
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              ¿Olvidaste tu contraseña? Contacta a administración.
            </p>
            <div className="mt-4 text-xs text-gray-400">
                <p>Credenciales Demo:</p>
                <p>admin@isfd26.edu.ar / 123</p>
                <p>alumno@isfd26.edu.ar / 123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;