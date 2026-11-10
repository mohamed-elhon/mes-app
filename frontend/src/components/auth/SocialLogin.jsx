import React from 'react';
import { Facebook, Twitter, Google, Github } from 'lucide-react';
import Button from '../ui/Button';

const SocialLogin = ({ onSocialLogin, loading = false }) => {
  // Social providers
  const providers = [
    { 
      name: 'Google', 
      icon: Google, 
      color: 'bg-red-500 hover:bg-red-600',
      value: 'google' 
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'bg-blue-600 hover:bg-blue-700',
      value: 'facebook' 
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      color: 'bg-blue-400 hover:bg-blue-500',
      value: 'twitter' 
    },
    { 
      name: 'GitHub', 
      icon: Github, 
      color: 'bg-gray-800 hover:bg-gray-900',
      value: 'github' 
    },
  ];

  // Handle social login
  const handleSocialLogin = (provider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <Button
            key={provider.value}
            variant="outline"
            className={`w-full ${provider.color} border-0 text-white`}
            onClick={() => handleSocialLogin(provider.value)}
            disabled={loading}
            leftIcon={provider.icon}
          >
            {provider.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SocialLogin;
