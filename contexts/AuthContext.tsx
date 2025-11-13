import { createContext, useContext } from "react";

type AuthResult =
  | { success: true }
  | { success: false; error?: string };

type AuthContextValue = {
  signIn(email: string, password: string): Promise<AuthResult>;
};

const defaultValue: AuthContextValue = {
  async signIn() {
    return { success: true };
  },
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

