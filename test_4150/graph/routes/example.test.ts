import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import type { Express } from 'express'
import request from 'supertest'
import { performRedirect } from '../../../routes/redirect'
import { createMockReq, createMockRes, createMockNext, type MockResponse, type MockNext } from '../../helpers/express.mock'
import { createTestApp } from '../../helpers/setup'

/**
 * GRAPH COVERAGE EXAMPLE
 *
 * Route under test: routes/redirect.ts -> performRedirect()
 *
 * Control Flow Graph (CFG) analysis:
 * - Node 1: Extract `toUrl = query.to`
 * - Decision (1 -> {2, 3}): `if (security.isRedirectAllowed(toUrl))`
 *   - Node 2 (True branch / Edge [1, 2]): Call `res.redirect(toUrl)`
 *   - Node 3 (False branch / Edge [1, 3]): Call `res.status(406)`, call `next(Error)`
 *
 * Test Requirements:
 * - Node Coverage (NC): Visit {Node 1, Node 2, Node 3}
 * - Edge Coverage (EC): Traverse Edge [1, 2] and Edge [1, 3]
 */

void describe('Graph Coverage (CFG): performRedirect (Unit Tests)', () => {
  let res: MockResponse
  let next: MockNext

  beforeEach(() => {
    res = createMockRes()
    next = createMockNext()
  })

  // Covers Node 1 -> Node 2 (Edge [1, 2]: isRedirectAllowed = true)
  void it('traverses Edge [1, 2] (True branch): redirects to allowed URL', () => {
    const req = createMockReq({
      query: { to: 'https://github.com/juice-shop/juice-shop' }
    })

    performRedirect()(req as any, res as any, next as any)

    assert.equal(res.redirect.mock.calls.length, 1)
    assert.equal(res.redirect.mock.calls[0].arguments[0], 'https://github.com/juice-shop/juice-shop')
    assert.equal(next.mock.calls.length, 0)
  })

  // Covers Node 1 -> Node 3 (Edge [1, 3]: isRedirectAllowed = false)
  void it('traverses Edge [1, 3] (False branch): responds with 406 for unrecognized URL', () => {
    const req = createMockReq({
      query: { to: 'https://malicious-site.example.com' }
    })

    performRedirect()(req as any, res as any, next as any)

    assert.equal(res.redirect.mock.calls.length, 0)
    assert.equal(res.statusCode, 406)
    assert.equal(next.mock.calls.length, 1)
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error)
  })
})

void describe('Graph Coverage (CFG): /redirect (Integration Tests)', () => {
  let app: Express

  before(async () => {
    const result = await createTestApp()
    app = result.app
  }, { timeout: 60000 })

  void it('integration Edge [1, 2]: redirects allowlisted URL with 302', async () => {
    const res = await request(app)
      .get('/redirect?to=https://github.com/juice-shop/juice-shop')

    assert.equal(res.status, 302)
    assert.equal(res.headers.location, 'https://github.com/juice-shop/juice-shop')
  })

  void it('integration Edge [1, 3]: returns 406 for disallowed redirect URL', async () => {
    const res = await request(app)
      .get('/redirect?to=https://malicious-site.example.com')

    assert.equal(res.status, 406)
  })
})
