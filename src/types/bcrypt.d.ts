declare module "bcryptjs" {
  /**
   * Hashes a password.
   * @param password The password to hash.
   * @param saltRounds The cost factor (rounds).
   * @returns A promise that resolves with the hashed password.
   */
  export function hash(password: string, saltRounds: number): Promise<string>;

  /**
   * Compares a password to a hash.
   * @param password The plain-text password.
   * @param hash The hashed password to compare against.
   * @returns A promise that resolves with true if the password matches, false otherwise.
   */
  export function compare(password: string, hash: string): Promise<boolean>;
}
