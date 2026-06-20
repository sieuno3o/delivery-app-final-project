export type UserRole = "customer" | "admin";

export function getConfiguredAdminEmails(
  value = process.env.ADMIN_EMAILS ?? "",
) {
  return new Set(
    value
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveUserRole(
  email: string,
  configuredEmails = process.env.ADMIN_EMAILS ?? "",
): UserRole {
  return getConfiguredAdminEmails(configuredEmails).has(
    email.trim().toLowerCase(),
  )
    ? "admin"
    : "customer";
}
