import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { normPhone, normContact, normRegisterName } from './validate.ts'
import { webhookSignatureOk, safeEqualHex } from './razorpay.ts'

test('phone, contact and Register name normalise', () => {
  assert.equal(normPhone('+91 98765 43210'), '9876543210')
  assert.equal(normPhone('09876543210'), '9876543210')
  assert.equal(normPhone('12345'), null)
  assert.equal(normContact(' Name@Example.com '), 'name@example.com')
  assert.equal(normContact('98765-43210'), '+919876543210')
  assert.equal(normContact('hello'), null)
  assert.equal(normRegisterName('aarav s'), 'Aarav S.')
  assert.equal(normRegisterName('Aarav S.'), 'Aarav S.')
  assert.equal(normRegisterName('Aarav Sharma'), null) // no full surnames on the Register
})

test('Razorpay signatures: valid passes, tampered fails', () => {
  const body = '{"event":"payment.captured"}'
  const good = createHmac('sha256', 'whsec').update(body).digest('hex')
  assert.equal(webhookSignatureOk(body, good, 'whsec'), true)
  assert.equal(webhookSignatureOk(body + ' ', good, 'whsec'), false)
  assert.equal(webhookSignatureOk(body, '', 'whsec'), false)
  assert.equal(safeEqualHex('ab', 'abc'), false)
})
