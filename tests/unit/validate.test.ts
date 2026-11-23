import { test, expect } from '@playwright/test'
import {
  BadInput,
  dateString,
  deepLink,
  integer,
  oneOf,
  readJson,
  slug,
  text,
  timeString,
} from '../../functions/_lib/validate'
import { timingSafeEqual } from '../../functions/_lib/bytes'

const body = (value: unknown, headers: Record<string, string> = {}) =>
  new Request('https://paulojuri.com/api/agent/notify', {
    method: 'POST',
    body: typeof value === 'string' ? value : JSON.stringify(value),
    headers,
  })

test('text is trimmed, capped and required', () => {
  expect(text('  hello  ', 'title', { max: 10 })).toBe('hello')
  expect(() => text('', 'title', { max: 10 })).toThrow(BadInput)
  expect(() => text('x'.repeat(11), 'title', { max: 10 })).toThrow(/at most 10/)
  expect(() => text(42, 'title', { max: 10 })).toThrow(/must be a string/)
})

test('a null byte cannot be smuggled through a string', () => {
  const withNull = ['ok', 'ay'].join(String.fromCharCode(0))
  expect(text(withNull, 'title', { max: 10 })).toBe('okay')
})

test('a deep link has to be a path on this site', () => {
  expect(deepLink('/app#inbox/12')).toBe('/app#inbox/12')
  expect(deepLink(undefined)).toBeUndefined()
  expect(() => deepLink('https://evil.example/x')).toThrow(/path on this site/)
  expect(() => deepLink('//evil.example/x')).toThrow(/path on this site/)
  expect(() => deepLink('javascript:alert(1)')).toThrow(/path on this site/)
  expect(() => deepLink('/app# <script>')).toThrow(/not allowed/)
})

test('oneOf falls back only when a fallback was given', () => {
  expect(oneOf(undefined, 'priority', ['low', 'normal'] as const, 'normal')).toBe('normal')
  expect(() => oneOf(undefined, 'priority', ['low', 'normal'] as const)).toThrow(/required/)
  expect(() => oneOf('urgent', 'priority', ['low', 'normal'] as const, 'normal')).toThrow(
    /one of: low, normal/,
  )
})

test('integers are bounded', () => {
  expect(integer('30', 'lead_minutes', { min: 0, max: 60 })).toBe(30)
  expect(integer(undefined, 'lead_minutes', { min: 0, max: 60, fallback: 0 })).toBe(0)
  expect(() => integer(1.5, 'lead_minutes', { min: 0, max: 60 })).toThrow(/whole number/)
  expect(() => integer(600, 'lead_minutes', { min: 0, max: 60 })).toThrow(/between 0 and 60/)
})

test('slugs keep projects and kinds URL-safe', () => {
  expect(slug('Alfera', 'project')).toBe('alfera')
  expect(slug('', 'project', 'general')).toBe('general')
  expect(() => slug('alfera; drop', 'project')).toThrow(/lowercase letters/)
})

test('dates and times have to be real', () => {
  expect(dateString('2026-11-30')).toBe('2026-11-30')
  expect(timeString('08:05')).toBe('08:05')
  expect(() => dateString('30-11-2026')).toThrow(/2026-11-30/)
  expect(() => timeString('25:00')).toThrow(/real time of day/)
  expect(() => timeString('8:00')).toThrow(/08:30/)
})

test('a body bigger than the cap is refused before it is parsed', async () => {
  await expect(readJson(body({ title: 'x'.repeat(200) }), 100)).rejects.toThrow(/too large/)
  await expect(readJson(body('not json'))).rejects.toThrow(/invalid json/)
  await expect(readJson(body([1, 2, 3]))).rejects.toThrow(/json object/)
  expect(await readJson(body({ title: 'ok' }))).toEqual({ title: 'ok' })
})

test('a content-length bigger than the cap is refused without reading the body', async () => {
  await expect(readJson(body({ a: 1 }, { 'content-length': '999999' }), 1000)).rejects.toThrow(
    /too large/,
  )
})

test('token comparison is length-safe and rejects the empty token', () => {
  expect(timingSafeEqual('abc', 'abc')).toBe(true)
  expect(timingSafeEqual('abc', 'abd')).toBe(false)
  expect(timingSafeEqual('abc', 'abcd')).toBe(false)
  expect(timingSafeEqual('', '')).toBe(false)
})
