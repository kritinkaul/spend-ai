import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  ArrowLeftRight,
  LineChart,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Analysis', href: '/analysis', icon: BarChart3 },
    { name: 'Stocks', href: '/stocks', icon: TrendingUp },
    { name: 'Visualizer', href: '/visualizer', icon: LineChart },
    { name: 'Converter', href: '/converter', icon: ArrowLeftRight },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Desktop: fixed, Mobile: drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm shadow-2xl border-r border-gray-200/50 dark:bg-gray-800/95 dark:border-gray-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 lg:h-20 items-center justify-between px-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transform hover:scale-110 hover:rotate-3 transition-all duration-300 border border-white/20">
                <DollarSign className="h-4 w-4 lg:h-6 lg:w-6 text-white font-bold drop-shadow-lg" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold gradient-text dark:text-white">SpendAI</h1>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar} // Close sidebar when navigating on mobile
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover-lift dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-400'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* App info section */}
          <div className="border-t border-gray-200/50 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:border-gray-700/50">
            <div className="flex items-center p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm dark:bg-gray-700/80 dark:border-gray-600/50">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-all duration-200 border border-white/30">
                  <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-white font-bold drop-shadow-md" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  SpendAI
                </p>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">Financial Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile Header with hamburger menu */}
        <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50 sticky top-0 z-30">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <DollarSign className="h-4 w-4 text-white font-bold" />
              </div>
              <h1 className="text-lg font-bold gradient-text dark:text-white">SpendAI</h1>
            </div>
            
            <div className="w-10"> {/* Spacer for balance */}</div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-white/80 backdrop-blur-sm border-b border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <div className="flex h-16 items-center justify-end">
              {/* Theme toggle space - temporarily removed */}
            </div>
          </div>
        </header>

        <main className="py-4 sm:py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/20 to-purple-200/20 rounded-full blur-3xl dark:from-primary-800/10 dark:to-purple-800/10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl dark:from-blue-800/10 dark:to-indigo-800/10"></div>
      </div>
    </div>
  );
} 