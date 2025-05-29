// import React from 'react';
import { ShieldX, AlertCircle, ArrowLeft, LogIn, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function UnauthorizedAccess() {

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleReturnClick = () => {
    navigate('/userdashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Top decorative accent */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>
        
        <div className="px-6 py-8 sm:px-10">
          {/* Icon and header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="absolute -inset-1 bg-red-600 rounded-full opacity-20 blur-md"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-red-700 rounded-full p-5">
                <ShieldX className="text-white" size={32} />
              </div>
            </div>
            
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Access Restricted</h2>
            <div className="h-1 w-12 bg-red-500 rounded-full mt-3 mb-4"></div>
            <p className="text-gray-600 text-center max-w-md">
              You don't have sufficient permissions to view this resource
            </p>
          </div>
          
          {/* Error details card */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-5 mb-8">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-red-800 mb-1">
                  Authentication Required
                </h3>
                <p className="text-red-700 text-sm">
                  This area requires additional privileges that your current account doesn't have. Please verify your credentials or request access from your system administrator.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleLoginClick}
              className="flex items-center justify-center px-5 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium transition-transform duration-200 transform hover:translate-y-px hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </button>
            
            <button
              onClick={handleReturnClick}
              className="flex items-center justify-center px-5 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Dashboard
            </button>
          </div>
          
          {/* Help links */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-sm text-gray-600 hover:text-red-600 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support Team
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-red-600 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Request Access Permissions
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Error Code: 401 — Anauthorize Access • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}