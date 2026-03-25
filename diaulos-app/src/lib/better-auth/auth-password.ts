// lib/auth-password.ts
import { hash, type Options, verify } from "@node-rs/argon2";

/**
 * Configuration options for Argon2 hashing and verification.
 * These settings are chosen to provide a good balance between security and performance.
 */
const opts: Options = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 lanes
  outputLen: 32, // 32 bytes
  algorithm: 2, // Argon2id
};

/**
 * Hashes a plaintext password using Argon2 with the specified options.
 * @param password - The plaintext password to hash.
 * @returns A promise that resolves to the hashed password string.
 */
export async function hashPassword(password: string) {
  const result = await hash(password, opts);

  return result;
}

/**
 * Verifies a plaintext password against a given hash using Argon2.
 * @param data - An object containing the plaintext password and the hash to verify against.
 * @returns A promise that resolves to a boolean indicating whether the password is valid.
 */
export async function verifyPassword(data: { password: string; hash: string }) {
  const { password, hash } = data;

  const result = await verify(hash, password, opts);

  return result;
}
