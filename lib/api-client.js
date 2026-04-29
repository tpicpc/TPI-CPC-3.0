"use client";

import axios from "axios";

export function adminApi() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function userApi() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
