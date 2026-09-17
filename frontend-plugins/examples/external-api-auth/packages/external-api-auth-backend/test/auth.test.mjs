import assert from "node:assert/strict";
import test from "node:test";

process.env.METATELL_CLIENT_ID = "test-client";
process.env.METATELL_ISSUER = "https://id.example.test/realms/test";

const { UnauthorizedError, assertValidSubject, getBearerToken } = await import("../dist/auth.js");

test("getBearerToken returns the bearer token", () => {
  assert.equal(getBearerToken("Bearer token-value"), "token-value");
});

test("getBearerToken accepts case-insensitive bearer schemes and whitespace", () => {
  assert.equal(getBearerToken("bearer\tlowercase-token"), "lowercase-token");
});

test("getBearerToken rejects missing or malformed authorization headers", () => {
  assert.throws(() => getBearerToken(undefined), UnauthorizedError);
  assert.throws(() => getBearerToken("Basic token-value"), UnauthorizedError);
  assert.throws(() => getBearerToken("Bearer"), UnauthorizedError);
  assert.throws(() => getBearerToken("Bearer token-value extra"), UnauthorizedError);
});

test("assertValidSubject accepts UUID v4 subjects", () => {
  assert.doesNotThrow(() =>
    assertValidSubject({
      sub: "550e8400-e29b-41d4-a716-446655440000"
    })
  );
});

test("assertValidSubject rejects missing, non-string, malformed, and non-v4 subjects", () => {
  assert.throws(() => assertValidSubject({}), UnauthorizedError);
  assert.throws(() => assertValidSubject({ sub: 123 }), UnauthorizedError);
  assert.throws(() => assertValidSubject({ sub: "not-a-uuid" }), UnauthorizedError);
  assert.throws(
    () => assertValidSubject({ sub: "550e8400-e29b-11d4-a716-446655440000" }),
    UnauthorizedError
  );
});
