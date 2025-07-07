import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('🔄 Theme toggle clicked. Current theme:', theme);
    toggleTheme();
    console.log('✅ Toggle function called');
  };

  console.log('🎨 ThemeToggle render - Current theme:', theme);

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative">
        {/* Sun icon for light mode */}
        <Sun
          className={cn(
            "h-5 w-5 transition-all duration-300",
            theme === 'dark' 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        
        {/* Moon icon for dark mode */}
        <Moon
          className={cn(
            "absolute top-0 left-0 h-5 w-5 transition-all duration-300",
            theme === 'light' 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </div>
      
      {/* Subtle glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg transition-opacity duration-300",
        theme === 'dark' 
          ? "bg-blue-500/10 opacity-100" 
          : "bg-yellow-500/10 opacity-100"
      )} />
    </button>
  );
}; 