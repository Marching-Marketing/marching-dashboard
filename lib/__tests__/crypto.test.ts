import { describe, it, expect, beforeEach } from 'vitest'
import { encrypt, decrypt } from '../crypto'

describe('crypto', () => {
  const testKey = 'a'.repeat(64) // 32 bytes of 0xAA — valid 64-char hex

  beforeEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = testKey
  })

  it('encrypts and decrypts a string roundtrip', () => {
    const plaintext = 'EAANWxRwIxBQ_test_token_value'
    const ciphertext = encrypt(plaintext)
    expect(decrypt(ciphertext)).toBe(plaintext)
  })

  it('produces different ciphertexts for the same input (random IV)', () => {
    const plaintext = 'same_token'
    const c1 = encrypt(plaintext)
    const c2 = encrypt(plaintext)
    expect(c1).not.toBe(c2)
  })

  it('ciphertext has iv:ciphertext:tag format', () => {
    const ciphertext = encrypt('token')
    const parts = ciphertext.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toHaveLength(24) // 12 bytes IV = 24 hex chars
  })

  it('throws on invalid TOKEN_ENCRYPTION_KEY', () => {
    process.env.TOKEN_ENCRYPTION_KEY = 'short'
    expect(() => encrypt('token')).toThrow('TOKEN_ENCRYPTION_KEY')
  })

  it('throws on tampered ciphertext (auth tag fails)', () => {
    const ciphertext = encrypt('token')
    const parts = ciphertext.split(':')
    // Tamper with the ciphertext part
    const tampered = parts[0] + ':' + 'ff'.repeat(parts[1].length / 2) + ':' + parts[2]
    expect(() => decrypt(tampered)).toThrow()
  })
})
