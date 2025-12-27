import backend from "~backend/client";
import { useAuth } from "../contexts/AuthContext";

export function useBackend() {
  const { getIdToken } = useAuth();

  const withAuth = async () => {
    const token = await getIdToken();
    if (!token) return backend; // unauthenticated
    return backend.with({ 
      auth: { authorization: `Bearer ${token}` }
    });
  };

  // expose both plain and authed modes
  return Object.assign(backend, { withAuth });
}
