"use client";

import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const HomeDataContext = createContext({
  loading: true,
  data: null,
  refetch: async () => {},
});

export function HomeDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/home-page/data");
      if (data.success) setData(data);
    } catch (err) {
      console.error("Home data fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <HomeDataContext.Provider value={{ data, loading, refetch: fetch }}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeData() {
  return useContext(HomeDataContext);
}
