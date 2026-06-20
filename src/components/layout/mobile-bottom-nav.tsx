import { getCurrentUser } from "@/lib/auth/session";

import { MobileBottomNavClient } from "./mobile-bottom-nav-client";

export async function MobileBottomNav() {
  const user = await getCurrentUser();

  return (
    <MobileBottomNavClient
      isAuthenticated={Boolean(user)}
      isAdmin={user?.role === "admin"}
    />
  );
}
