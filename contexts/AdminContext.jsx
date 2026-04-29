"use client";

import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AdminContext = createContext({
  admin: null,
  loading: true,
  fetchAdmin: async () => {},
  logout: () => {},
});

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get("/api/v1/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setAdmin(data.admin);
      else setAdmin(null);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setAdmin(null);
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  return (
    <AdminContext.Provider value={{ admin, loading, fetchAdmin, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
