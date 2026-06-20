import { compare, hash } from "bcryptjs";

const PASSWORD_COST = 12;

export const DUMMY_PASSWORD_HASH =
  "$2b$12$tmRDNNoajVjLMXI6vmX/deXPg//iovjc1GiB.TcNE.Mh9Mjg5BMza";

export function hashPassword(password: string) {
  return hash(password, PASSWORD_COST);
}

export function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}
