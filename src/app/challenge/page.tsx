'use client';

import { useState, useEffect } from 'react';

export default function ChallengePage() {
  const [status, setStatus] = useState<'loading' | 'challenging' | 'verifying' | 'success' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing security check...');

  useEffect(() => {
    performChallenge();
  }, []);

  async function performChallenge() {
    try {
      setStatus('loading');
      setMessage('Fetching security challenge...');
      setProgress(10);

      // Get challenge from API
      const challengeRes = await fetch('/api/v1/challenge');
      const challengeData = await challengeRes.json();
      
      setProgress(30);
      setStatus('challenging');
      setMessage('Solving security challenge...');

      // Simulate JS computation (proof of work)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(50);

      // Compute answer (hash of token + secret pattern)
      const encoder = new TextEncoder();
      const data = encoder.encode(challengeData.token + ':montara-challenge-secret-2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const answer = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

      setProgress(70);
      setMessage('Verifying response...');
      setStatus('verifying');

      // Submit answer
      const verifyRes = await fetch('/api/v1/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: challengeData.token,
          answer,
        }),
      });

      const verifyData = await verifyRes.json();
      setProgress(100);

      if (verifyData.success) {
        setStatus('success');
        setMessage('Verification successful! Redirecting...');
        
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = verifyData.redirect || '/';
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please refresh the page.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
        {/* Logo/Shield Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Security Check
        </h1>
        
        <p className="text-gray-400 text-center mb-6">
          Verifying your browser to protect against DDoS attacks
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">{progress}%</p>
        </div>

        {/* Status Message */}
        <div className="flex items-center justify-center gap-3">
          {status === 'loading' || status === 'challenging' || status === 'verifying' ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : status === 'success' ? (
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className={`font-medium ${
            status === 'success' ? 'text-green-400' : 
            status === 'error' ? 'text-red-400' : 
            'text-gray-300'
          }`}>
            {message}
          </span>
        </div>

        {/* Retry Button */}
        {status === 'error' && (
          <button
            onClick={() => performChallenge()}
            className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Protected by <span className="text-blue-400 font-semibold">Montara WAF</span>
          </p>
        </div>
      </div>
    </div>
  );
}
