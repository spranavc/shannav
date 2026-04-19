import { createContext, useContext, useEffect, useState } from "react";
import { getSession, signOut } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then((session) => {
        setUser({ email: session.getIdToken().payload.email });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
