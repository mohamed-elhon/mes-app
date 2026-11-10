import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

// Create context
const ThemeContext = createContext(null);

// Provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (storedTheme) return storedTheme;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const [direction, setDirection] = useState('ltr');
  const [language, setLanguage] = useState('en');

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Update localStorage
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#3b82f6');
    }
  }, [theme]);

  // Apply direction on mount and when direction changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('dir', direction);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [direction, language]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Set theme explicitly
  const setThemeExplicitly = (newTheme) => {
    setTheme(newTheme);
  };

  // Toggle direction
  const toggleDirection = () => {
    setDirection(prevDirection => (prevDirection === 'ltr' ? 'rtl' : 'ltr'));
    setLanguage(prevLanguage => (prevLanguage === 'en' ? 'ar' : 'en'));
  };

  // Set direction explicitly
  const setDirectionExplicitly = (newDirection) => {
    setDirection(newDirection);
    setLanguage(newDirection === 'rtl' ? 'ar' : 'en');
  };

  // Context value
  const value = {
    theme,
    direction,
    language,
    toggleTheme,
    setTheme: setThemeExplicitly,
    toggleDirection,
    setDirection: setDirectionExplicitly,
    setLanguage,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export context
export { ThemeContext };
