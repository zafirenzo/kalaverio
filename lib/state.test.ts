import { test } from 'node:test'
import assert from 'node:assert/strict'
import { phaseAt, left, setButton, counter } from './state.ts'

const cfg = { opensAt: '2026-10-14T20:00:00+05:30', closesAt: '2026-10-25T00:00:00+05:30', threshold: 30 }

test('phases switch on launch night and at close', () => {
  assert.equal(phaseAt(new Date('2026-10-14T19:59:59+05:30'), 0, cfg), 'before')
  assert.equal(phaseAt(new Date('2026-10-14T20:00:00+05:30'), 0, cfg), 'open')
  assert.equal(phaseAt(new Date('2026-10-25T00:00:00+05:30'), 29, cfg), 'closed-under')
  assert.equal(phaseAt(new Date('2026-10-25T00:00:00+05:30'), 30, cfg), 'closed-over')
  assert.equal(phaseAt(new Date('2026-10-01'), 0, cfg, 'open'), 'open')
})

test('sets left never goes below zero and sold-out swaps the button', () => {
  assert.equal(left(10, 12), 0)
  assert.equal(setButton('open', 0), 'Join the waitlist for Volume II')
  assert.equal(setButton('open', 3), 'Reserve your set')
  assert.deepEqual(counter('open', 7, 10, '14 October', '25 October'), { n: 'Nº 07', text: 'of 10 left' })
  assert.equal(counter('open', 0, 10, '', '').text, 'Sold out')
})
