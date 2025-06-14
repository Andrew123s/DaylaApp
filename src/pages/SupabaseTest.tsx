import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Settings, AlertTriangle } from 'lucide-react';
import SupabaseStatus from '../components/SupabaseStatus';

const SupabaseTest: React.FC = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Supabase Connection Test</h1>
          </div>

          {/* Connection Status */}
          <div className="mb-8">
            <SupabaseStatus />
          </div>

          {/* Environment Variables Check */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Environment Variables</span>
            </h2>
            
            <div className="space-y-3">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm text-gray-700">{key}</span>
                  <div className="flex items-center space-x-2">
                    {value ? (
                      <>
                        <span className="text-green-600 text-sm">✓ Set</span>
                        <span className="font-mono text-xs text-gray-500">
                          {key === 'VITE_SUPABASE_URL' ? value : '••••••••'}
                        </span>
                      </>
                    ) : (
                      <span className="text-red-600 text-sm">✗ Missing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Setup Instructions</h3>
                <div className="text-yellow-700 space-y-2">
                  <p>If you're seeing connection errors, follow these steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                    <li>Go to Settings → API in your Supabase dashboard</li>
                    <li>Copy your Project URL and anon public key</li>
                    <li>Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file in your project root</li>
                    <li>Add the following lines to your .env file:</li>
                  </ol>
                  <div className="bg-yellow-100 p-3 rounded mt-3 font-mono text-sm">
                    VITE_SUPABASE_URL=your_project_url<br />
                    VITE_SUPABASE_ANON_KEY=your_anon_key
                  </div>
                  <p className="text-sm">After updating the .env file, restart your development server.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;