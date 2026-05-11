import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/user';

export function useAuth() {
  const store = useAuthStore();
  const { user, accessToken, isAuthenticated, login, register, logout, updateUser, isLoading } = store;

  const useCurrentUser = () => {
    return useQuery({
      queryKey: ['currentUser'],
      queryFn: () => authApi.getCurrentUser(),
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
    });
  };

  const loginFn = useCallback(
    async (data: LoginRequest) => {
      await login(data);
    },
    [login]
  );

  const registerFn = useCallback(
    async (data: RegisterRequest) => {
      await register(data);
    },
    [register]
  );

  const logoutFn = useCallback(() => {
    logout();
  }, [logout]);

  return {
    user,
    isAuthenticated,
    accessToken,
    login: loginFn,
    register: registerFn,
    logout: logoutFn,
    updateUser,
    useCurrentUser,
    isLoggingIn: isLoading,
    isRegistering: isLoading,
    loginError: null,
    registerError: null,
  };
}
