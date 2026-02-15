import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useWalletStore from '../store/wallet';
import Header from './Header';
import StatusIndicators from './StatusIndicators';

const Layout = ({ children }) => {
  const { isAuthenticated, user, initializeFromStorage } = useWalletStore();

  useEffect(() => {
    if (initializeFromStorage) {
      initializeFromStorage();
    }
  }, [initializeFromStorage]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col w-[380px] h-[600px] overflow-hidden">
      <Header />
      <StatusIndicators />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
      <main id="main-content" className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
