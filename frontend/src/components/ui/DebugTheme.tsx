import { useTheme } from '../../contexts/ThemeContext';

export const DebugTheme = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50">
      <div className="text-sm text-gray-900 dark:text-gray-100">
        <p><strong>Current Theme:</strong> {theme}</p>
        <p><strong>HTML Classes:</strong> {document.documentElement.classList.toString()}</p>
        <p><strong>LocalStorage:</strong> {localStorage.getItem('theme')}</p>
        <button 
          onClick={toggleTheme}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}; 