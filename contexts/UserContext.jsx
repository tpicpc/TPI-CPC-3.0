"use client";

import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const UserContext = createContext({
  userData: null,
  loading: true,
  fetchUserData: async () => {},
  logout: () => {},
});

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUserData(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get("/api/v1/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setUserData(data.user);
      else setUserData(null);
    } catch {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUserData(null);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <UserContext.Provider value={{ userData, loading, fetchUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
