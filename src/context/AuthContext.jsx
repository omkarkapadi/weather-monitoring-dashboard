import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useProfile } from "../hooks/useProfile.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();
  const profileState = useProfile(auth.user);
  return (
    <AuthContext.Provider value={{ ...auth, ...profileState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return value;
}
