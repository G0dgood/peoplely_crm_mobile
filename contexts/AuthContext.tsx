import {
  useLoginMutation,
  useLogoutMutation,
} from "@/store/services/teamMembersApi";
import { setCredentials } from "@/store/slices/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";

type User = {
  roleId?: any;
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
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
  checkAuth: () => Promise<boolean>;
  validateToken: () => boolean;
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
  updateUser: () => { },
  async signIn() {
    return { success: true };
  },
  async signUp() {
    return { success: true };
  },
  async signOut() { },
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setTokens: () => { },
  clearTokens: () => { },
  checkAuth: async () => false,
  validateToken: () => false,
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

  console.log("user----->", user);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("peoplely-user");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setTokensState({ accessToken: storedToken });
        } else {
          const stored = await AsyncStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.user) {
              setUser(parsed.user);
            }
            if (parsed.tokens) {
              setTokensState(parsed.tokens);
            }
          }
        }
      } catch {
        await AsyncStorage.removeItem(storageKey);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, [storageKey]);

  const getAccessToken = useCallback(() => {
    return tokens?.accessToken || null;
  }, [tokens]);

  const getRefreshToken = useCallback(() => {
    return tokens?.refreshToken || null;
  }, [tokens]);

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
        roleId: undefined
      };

      // Extract and save privileges
      if (response?.teamMember?.role || response?.user?.role) {
        const roleData = response?.teamMember?.role || response?.user?.role;
        // Ensure roleData has the expected structure or wrap it
        const roleObj = typeof roleData === 'string' ? { roleName: roleData, permissions: [] } : roleData;

        const privileges = {
          userId: String(resolvedId),
          roleId: roleObj._id || roleObj.id || "",
          role: roleObj
        };

        try {
          await AsyncStorage.setItem("userPrivileges", JSON.stringify(privileges));
        } catch (e) {
          console.error("Failed to save privileges", e);
        }
      }

      setUser(nextUser);
      setTokensState({ accessToken: response.accessToken });
      try {
        await AsyncStorage.setItem("peoplely-user", JSON.stringify(nextUser));
        await AsyncStorage.setItem("token", String(response.accessToken));
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify({ user: nextUser, tokens: { accessToken: response.accessToken }, savedAt: Date.now() })
        );
      } catch { }
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
        } catch (_e) { }
      }
      setUser(null);
      setAuthData(null);
      setTokensState(null);
      await AsyncStorage.removeItem("peoplely-user");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userPrivileges");
      await AsyncStorage.removeItem(storageKey);
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  const saveAuthData = useCallback(
    (userData: User | null, tokenData: AuthTokens | null) => {
      if (userData && tokenData) {
        AsyncStorage.setItem(
          storageKey,
          JSON.stringify({ user: userData, tokens: tokenData, savedAt: Date.now() })
        ).catch(() => { });
      } else {
        AsyncStorage.removeItem(storageKey).catch(() => { });
      }
    },
    [storageKey]
  );

  const clearAuthData = useCallback(async () => {
    setUser(null);
    setTokensState(null);
    await AsyncStorage.removeItem(storageKey);
  }, [storageKey]);

  const setTokens = useCallback(
    (tokenData: AuthTokens) => {
      setTokensState(tokenData);
      if (user) {
        saveAuthData(user, tokenData);
      }
    },
    [user, saveAuthData]
  );

  const clearTokens = useCallback(() => {
    setTokensState(null);
    if (user) {
      saveAuthData(user, null);
    }
  }, [user, saveAuthData]);

  const validateToken = useCallback(() => {
    if (!tokens?.accessToken) return false;
    return true;
  }, [tokens]);

  const checkAuth = useCallback(async () => {
    if (!validateToken()) {
      await clearAuthData();
      return false;
    }
    const token = getAccessToken();
    if (!token) {
      await clearAuthData();
      return false;
    }
    return true;
  }, [validateToken, getAccessToken, clearAuthData]);

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
    isAuthenticated: !!user && !!tokens?.accessToken && validateToken(),
    authData,
    signIn,
    signUp,
    signOut,
    updateUser,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    checkAuth,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
