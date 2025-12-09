import { useLoginMutation } from "@/store/services/teamMembersApi";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthResult =
  | { success: true; user?: User }
  | { success: false; error?: string };

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authData: any | null;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, name?: string): Promise<AuthResult>;
  signOut(): Promise<void>;
};

const defaultValue: AuthContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  authData: null,
  async signIn() {
    return { success: true };
  },
  async signUp() {
    return { success: true };
  },
  async signOut() {},
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<any | null>(null);
  const [login] = useLoginMutation();

  // Check for existing session on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // TODO: Check for stored auth token/session
      // For now, we'll just set loading to false
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking auth state:", error);
      setIsLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      const response = await login({ userId: email, password }).unwrap();
      setAuthData(response);

      const resolvedEmail =
        response?.user?.email || response?.teamMember?.email || email;
      const resolvedId =
        response?.user?.id ||
        response?.user?._id ||
        response?.teamMember?._id ||
        email;
      const resolvedName =
        response?.user?.name || response?.teamMember?.name || undefined;

      const nextUser: User = {
        id: String(resolvedId),
        email: String(resolvedEmail),
        name: resolvedName,
      };

      setUser(nextUser);
      setIsLoading(false);
      return { success: true, user: nextUser };
    } catch (error) {
      setIsLoading(false);
      const anyErr: any = error as any;
      const message =
        anyErr?.data?.message ||
        anyErr?.error ||
        anyErr?.message ||
        "Sign in failed";
      return { success: false, error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      // TODO: Implement actual API call
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful signup
      const mockUser: User = {
        id: "1",
        email,
        name: name || "User",
      };

      setUser(mockUser);
      setIsLoading(false);
      return { success: true, user: mockUser };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // TODO: Clear stored auth token/session
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    authData,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
