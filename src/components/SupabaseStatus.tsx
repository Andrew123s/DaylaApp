import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { testSupabaseConnection } from '../lib/supabase-test';

const SupabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isRetesting, setIsRetesting] = useState(false);

  const runTest = async () => {
    setIsRetesting(true);
    setStatus('loading');
    
    try {
      const result = await testSupabaseConnection();
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Connection successful');
      } else {
        setStatus('error');
        setMessage(result.error || 'Connection failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Unexpected error occurred');
    } finally {
      setIsRetesting(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900">Supabase Connection</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <button
            onClick={runTest}
            disabled={isRetesting}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {isRetesting ? 'Testing...' : 'Retest'}
          </button>
        </div>
      </div>
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
          <h4 className="font-medium text-red-800 mb-2">Troubleshooting Steps:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
            <li>• Verify your Supabase project is active (not paused)</li>
            <li>• Ensure your project URL and keys are correct</li>
            <li>• Check browser console for additional error details</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SupabaseStatus;