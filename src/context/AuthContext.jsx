import { createContext, useContext, useMemo } from "react";
import { useApproved } from "../hooks/useApproved.js";
import { useAuth } from "../hooks/useAuth.js";
import { useProfile } from "../hooks/useProfile.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();
  const approvedState = useApproved(auth.user);
  const profileState = useProfile(auth.user, approvedState.approved);
  const loading = auth.loading || approvedState.loading || profileState.loading;
  const value = useMemo(
    () => ({
      ...auth,
      ...profileState,
      approved: approvedState.approved,
      accessError: Boolean(approvedState.error || profileState.error),
      authLoading: auth.loading,
      profileLoading: profileState.loading,
      loading,
    }),
    [auth, profileState, approvedState.approved, approvedState.error, approvedState.loading, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return value;
}
