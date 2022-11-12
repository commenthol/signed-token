export interface SignedTokenReturn {
  hmac (token: string): string
  create (): Promise<string>
  createSync(): string
  verify (token: string): Promise<string|undefined>
  verifySync (token: string): string|undefined
}