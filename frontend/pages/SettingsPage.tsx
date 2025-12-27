// SettingsPage.tsx
import { useAuth } from "../contexts/AuthContext";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Account Settings</h2>
      <p>Email: {user?.email}</p>
      {/* TODO: form to update profile via Supabase */}
    </div>
  );
}
