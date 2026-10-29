import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import type { Express } from 'express'
import request from 'supertest'
import { performRedirect } from '../../../routes/redirect'
import { createMockReq, createMockRes, createMockNext, type MockResponse, type MockNext } from '../../helpers/express.mock'
import { createTestApp } from '../../helpers/setup'

/**
 * INPUT SPACE PARTITIONING (ISP) TESTING EXAMPLE
 *
 * Route under test: routes/redirect.ts -> performRedirect()
 * Input Parameter: query.to
 *
 * Characteristic C1: Allowlist status of `query.to`
 * - Block b1: Standard allowlisted URL (Base Choice)
 * - Block b2: Crypto donation allowlisted URL
 * - Block b3: Unintended redirect allowlist bypass URL
 * - Block b4: Disallowed external URL
 * - Block b5: Empty string URL ('')
 * - Block b6: Missing or undefined parameter
 *
 * Coverage Criterion: Base Choice Coverage (BCC)
 * - Test 1 [Base Choice, b1]: Valid allowlisted URL -> 302 / res.redirect
 * - Test 2 [Variant 1, b2]: Cryptocurrency address -> 302 / res.redirect
 * - Test 3 [Variant 2, b3]: Bypass URL -> 302 / res.redirect
 * - Test 4 [Variant 3, b4]: Disallowed URL -> 406 / next(Error)
 * - Test 5 [Variant 4, b5]: Empty string URL -> 406 / next(Error)
 * - Test 6 [Variant 5, b6]: Missing parameter -> throws TypeError / 500
 */

void describe('Input Space Partitioning (ISP): performRedirect (Unit Tests)', () => {
  let res: MockResponse
  let next: MockNext

  beforeEach(() => {
    res = createMockRes()
    next = createMockNext()
  })

  // Base Choice (Block b1: Standard allowlisted URL)
  void it('[BCC Base Choice - Block b1]: redirects for standard allowlisted URL', () => {
    const req = createMockReq({
      query: { to: 'https://github.com/juice-shop/juice-shop' }
    })

    performRedirect()(req as any, res as any, next as any)

    assert.equal(res.redirect.mock.calls.length, 1)
    assert.equal(res.redirect.mock.calls[0].arguments[0], 'https://github.com/juice-shop/juice-shop')
    assert.equal(next.mock.calls.length, 0)
  })

  // Variant 1 (Block b2: Crypto allowlist URL)
  void it('[BCC Variant 1 - Block b2]: redirects for cryptocurrency allowlisted address', () => {
    const cryptoUrl = 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm'
    const req = createMockReq({
      query: { to: cryptoUrl }
    })

    performRedirect()(req as any, res as any, next as any)

    assert.equal(res.redirect.mock.calls.length, 1)
    assert.equal(res.redirect.mock.calls[0].arguments[0], cryptoUrl)
  })

  // Variant 2 (Block b3: Bypass URL)
  void it('[BCC Variant 2 - Block b3]: redirects for bypass URL tricking allowlist prefix', () => {
    const bypassUrl = 'http://kimminich.de?to=https://github.com/juice-shop/juice-shop'
    const req = createMockReq({
      query: { to: bypassUrl }
    })

    performRedirect()(req as any, res as any, next as any)

    assert.equal(res.redirect.mock.calls.length, 1)
    assert.equal(res.redirect.mock.calls[0].arguments[0], bypassUrl)
  })

  // Variant 3 (Block b4: Disallowed external URL)
  void it('[BCC Variant 3 - Block b4]: sets 406 and next(Error) for disallowed URL', () => {
    const req = createMockReq({
      query: { to: 'https://malicious.example.com' }
    })

    performRedirect()(req as any, res as any, next as any)

    assert.equal(res.redirect.mock.calls.length, 0)
    assert.equal(res.statusCode, 406)
    assert.equal(next.mock.calls.length, 1)
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error)
  })

  // Variant 4 (Block b5: Empty string URL)
  void it('[BCC Variant 4 - Block b5]: sets 406 and next(Error) when parameter is empty string', () => {
    const req = createMockReq({
      query: { to: '' }
    })

    performRedirect()(req as any, res as any, next as any)

    assert.equal(res.redirect.mock.calls.length, 0)
    assert.equal(res.statusCode, 406)
    assert.equal(next.mock.calls.length, 1)
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error)
  })

  // Variant 5 (Block b6: Missing / undefined URL)
  void it('[BCC Variant 5 - Block b6]: throws TypeError when parameter is undefined', () => {
    const req = createMockReq({
      query: {}
    })

    assert.throws(
      () => performRedirect()(req as any, res as any, next as any),
      TypeError
    )
  })
})

void describe('Input Space Partitioning (ISP): /redirect (Integration Tests)', () => {
  let app: Express

  before(async () => {
    const result = await createTestApp()
    app = result.app
  }, { timeout: 60000 })

  void it('[BCC Base Choice - Block b1]: integration returns 302 for allowlisted URL', async () => {
    const res = await request(app)
      .get('/redirect?to=https://github.com/juice-shop/juice-shop')

    assert.equal(res.status, 302)
    assert.equal(res.headers.location, 'https://github.com/juice-shop/juice-shop')
  })

  void it('[BCC Variant 3 - Block b4]: integration returns 406 for disallowed URL', async () => {
    const res = await request(app)
      .get('/redirect?to=https://malicious.example.com')

    assert.equal(res.status, 406)
  })

  void it('[BCC Variant 4 - Block b5]: integration returns 406 for empty string parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=')

    assert.equal(res.status, 406)
  })

  void it('[BCC Variant 5 - Block b6]: integration returns 500 when parameter is omitted entirely', async () => {
    const res = await request(app)
      .get('/redirect')

    assert.equal(res.status, 500)
  })
})
