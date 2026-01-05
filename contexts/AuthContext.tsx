import {
  useLoginMutation,
  useLogoutMutation,
} from "@/store/services/teamMembersApi";
import { setCredentials } from "@/store/slices/authSlice";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";

type User = {
  id: string;
  email: string;
  name?: string;
  roleName?: string;
};

// Authentication tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

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

  updateUser: (updates: Partial<User>) => void;
};

// Auth context type
interface AuthContextType {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Authentication methods
  updateUser: (updates: Partial<User>) => void;

  // Token management
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;

  // Session management
  checkAuth: () => Promise<boolean>;
  validateToken: () => boolean;
}

const defaultValue: AuthContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  authData: null,
  updateUser: () => {},
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
  storageKey?: string;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  storageKey = "auth_data",
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<any | null>(null);
  const [login] = useLoginMutation();
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);

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
      const resolvedRoleName =
        response?.teamMember?.role?.roleName || response?.user?.role || "agent";

      const nextUser: User = {
        id: String(resolvedId),
        email: String(resolvedEmail),
        name: resolvedName || "",
        roleName: resolvedRoleName,
      };

      setUser(nextUser);
      // Dispatch to Redux store
      dispatch(
        setCredentials({
          user: {
            id: nextUser.id,
            email: nextUser.email,
            name: nextUser.name || "",
            role: nextUser.roleName || "",
          },
          token: response.accessToken,
        })
      );

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
      const tm = (authData && (authData.user || authData.teamMember)) || {};
      const uid = tm.userId || tm.username || user?.email || user?.id || "";
      if (uid) {
        try {
          await logoutApi({ userId: String(uid) }).unwrap();
        } catch (_e) {}
      }
      setUser(null);
      setAuthData(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  // Save auth data to localStorage
  const saveAuthData = useCallback(
    (userData: User | null, tokenData: AuthTokens | null) => {
      if (typeof window === "undefined") return;

      try {
        if (userData && tokenData) {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              user: userData,
              tokens: tokenData,
            })
          );
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.error("Error saving auth data to storage:", error);
      }
    },
    [storageKey]
  );

  // Update user
  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        if (tokens) {
          saveAuthData(updatedUser, tokens);
        }
      }
    },
    [user, tokens, saveAuthData]
  );

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    authData,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
