import { api } from "encore.dev/api";

export const health = api(
  {
    method: "GET",
    path: "/health",
  },
  async () => {
    return { ok: true };
  }
);

