import { test, expect } from '@playwright/test'
import { brusselsLabel, brusselsToUtc, nextOccurrence, toWall } from '../../functions/_lib/time'

test('winter time is UTC+1', () => {
  expect(brusselsToUtc('2026-11-24', '08:30')).toBe('2026-11-24T07:30:00.000Z')
})

test('summer time is UTC+2', () => {
  expect(brusselsToUtc('2026-07-24', '08:30')).toBe('2026-07-24T06:30:00.000Z')
})

test('the hours either side of the spring clock change', () => {
  // Brussels springs forward at 02:00 local on 29 March 2026.
  expect(brusselsToUtc('2026-03-29', '01:30')).toBe('2026-03-29T00:30:00.000Z') // still CET
  expect(brusselsToUtc('2026-03-29', '03:30')).toBe('2026-03-29T01:30:00.000Z') // already CEST
})

test('the hours either side of the autumn clock change', () => {
  // Brussels falls back at 03:00 local on 25 October 2026.
  expect(brusselsToUtc('2026-10-25', '01:30')).toBe('2026-10-24T23:30:00.000Z') // CEST
  expect(brusselsToUtc('2026-10-25', '04:30')).toBe('2026-10-25T03:30:00.000Z') // CET
})

test('a UTC instant reads back as the Brussels wall clock', () => {
  expect(toWall('2026-11-24T07:30:00.000Z')).toEqual({ date: '2026-11-24', time: '08:30', weekday: 2 })
  expect(toWall('2026-07-24T06:30:00.000Z')).toEqual({ date: '2026-07-24', time: '08:30', weekday: 5 })
})

test('a daily reminder keeps its local time across the clock change', () => {
  // 08:00 Brussels on the Saturday before the spring change, repeating daily.
  const saturday = brusselsToUtc('2026-03-28', '08:00')
  expect(saturday).toBe('2026-03-28T07:00:00.000Z')
  const sunday = nextOccurrence(saturday, 'daily', new Date('2026-03-28T07:01:00Z'))
  expect(sunday).toBe('2026-03-29T06:00:00.000Z') // one hour earlier in UTC, still 08:00 in Brussels
  expect(toWall(sunday!).time).toBe('08:00')
})

test('weekdays skips the weekend', () => {
  const friday = brusselsToUtc('2026-11-27', '09:00')
  expect(toWall(friday).weekday).toBe(5)
  const next = nextOccurrence(friday, 'weekdays', new Date('2026-11-27T08:01:00Z'))
  expect(toWall(next!)).toEqual({ date: '2026-11-30', time: '09:00', weekday: 1 })
})

test('weekly lands on the same weekday', () => {
  const next = nextOccurrence(brusselsToUtc('2026-11-24', '18:15'), 'weekly', new Date('2026-11-24T17:16:00Z'))
  expect(toWall(next!)).toEqual({ date: '2026-12-01', time: '18:15', weekday: 2 })
})

test('a reminder that fired days late skips to the next slot in the future', () => {
  const start = brusselsToUtc('2026-11-01', '07:00')
  const next = nextOccurrence(start, 'daily', new Date('2026-11-20T12:00:00Z'))
  expect(toWall(next!).date).toBe('2026-11-21')
})

test('no repeat means no next occurrence', () => {
  expect(nextOccurrence(brusselsToUtc('2026-11-24', '08:00'), 'none')).toBeNull()
})

test('labels are Brussels time, not UTC', () => {
  expect(brusselsLabel('2026-11-24T07:30:00.000Z')).toMatch(/^Tue 24 Nov, 08:30$/)
})
