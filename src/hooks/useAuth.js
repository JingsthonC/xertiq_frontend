import { useState, useEffect } from 'react';
import useWalletStore from '../store/wallet';
import apiService from '../services/api';
import chromeService from '../services/chrome';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    isAuthenticated,
    user,
    token,
    refreshToken,
    setAuth,
    logout: storeLogout,
    setError: setStoreError,
    clearError
  } = useWalletStore();

  // Check auth status on hook init
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedAuth = await chromeService.getStorage('xertiq-wallet-storage');
      if (storedAuth?.state?.token && storedAuth?.state?.user) {
        setAuth(storedAuth.state.user, storedAuth.state.token);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    clearError();

    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.token && response.user) {
        setAuth(response.user, response.token, response.refreshToken || null);

        // Store in Chrome storage for persistence
        await chromeService.setStorage('xertiq-wallet-storage', {
          state: {
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken || null,
          }
        });

        chromeService.showNotification(
          'Login Successful',
          `Welcome back, ${response.user.name}!`
        );

        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      setStoreError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    clearError();

    try {
      const response = await apiService.register(name, email, password);
      
      if (response.success) {
        chromeService.showNotification(
          'Registration Successful',
          'Please log in with your credentials'
        );
        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      setStoreError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await apiService.logout(refreshToken);
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API fails
    }

    // Clear local state
    storeLogout();
    
    // Clear Chrome storage
    await chromeService.removeStorage('xertiq-wallet-storage');
    
    chromeService.showNotification(
      'Logged Out',
      'You have been successfully logged out'
    );

    setIsLoading(false);
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      // This would need to be implemented in the backend
      const response = await apiService.api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        chromeService.showNotification(
          'Password Reset',
          'Check your email for reset instructions'
        );
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthError = () => {
    setError(null);
    clearError();
  };

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    clearError: clearAuthError
  };
};

export default useAuth;
