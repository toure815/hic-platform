import { Client } from "./client";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const api = new Client(API_URL, {
  requestInit: { credentials: "include" }
});

