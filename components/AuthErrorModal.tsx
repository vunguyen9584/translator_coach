
import React, { useEffect, useState } from 'react';

interface AuthErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDemoLogin: () => void;
  errorDomain?: string;
}

const AuthErrorModal: React.FC<AuthErrorModalProps> = ({ isOpen, onClose, onDemoLogin, errorDomain }) => {
  const [domainInfo, setDomainInfo] = useState<{ hostname: string; fullUrl: string }>({ 
    hostname: 'loading...', 
    fullUrl: '' 
  });

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      let currentHost = window.location.hostname;
      
      // Fallback strategies if hostname is empty (common in some web containers/iframes)
      if (!currentHost) {
        currentHost = window.location.host;
      }
      if (!currentHost) {
        // Try to strip protocol from origin if all else fails
        const origin = window.location.origin;
        currentHost = origin.replace(/(^\w+:|^)\/\//, '');
      }

      setDomainInfo({
        hostname: currentHost || 'unknown-domain',
        fullUrl: window.location.href
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
        
        <div className="flex items-start gap-4 mb-4 mt-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Domain Not Authorized</h3>
            <p className="text-slate-500 text-sm mt-1">
              Firebase Auth rejected the login request from this domain.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm">
          <p className="font-semibold text-slate-700 mb-2">To fix this in production:</p>
          <ol className="list-decimal pl-4 space-y-1 text-slate-600 mb-3">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Firebase Console</a></li>
            <li>Select your project &rarr; Authentication &rarr; Settings</li>
            <li>Add the domain below to <strong>Authorized Domains</strong>:</li>
          </ol>
          
          <div className="bg-white p-2 border border-slate-300 rounded font-mono text-xs text-rose-600 break-all select-all">
            {domainInfo.hostname}
          </div>

          <div className="mt-2 text-[10px] text-slate-400">
            <span className="font-bold">Full URL (for debugging):</span> {domainInfo.fullUrl}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onDemoLogin}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Continue using Demo Account
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorModal;
