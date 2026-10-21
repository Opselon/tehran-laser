import { describe, expect, it } from 'vitest';
import { cspSafeCover, readingMinutes } from '../../src/lib/content/blog-presenter';

/**
 * Both the blog index and the homepage journal strip render the same rows, so
 * these rules are tested once here rather than trusted to stay in sync by hand.
 */

const ORIGIN = 'https://tehran-laser.example';

describe('cspSafeCover', () => {
  it('keeps same-origin and relative covers', () => {
    expect(cspSafeCover('/images/post.jpg', ORIGIN)).toBe('/images/post.jpg');
    expect(cspSafeCover(`${ORIGIN}/images/post.jpg`, ORIGIN)).toBe(`${ORIGIN}/images/post.jpg`);
    expect(cspSafeCover('data:image/png;base64,AAA', ORIGIN)).toBe('data:image/png;base64,AAA');
    expect(cspSafeCover('blob:https://x/abc', ORIGIN)).toBe('blob:https://x/abc');
  });

  it('drops off-site covers the public CSP would block', () => {
    expect(cspSafeCover('https://cdn.example/post.jpg', ORIGIN)).toBeUndefined();
    expect(cspSafeCover('http://tehran-laser.example/post.jpg', ORIGIN)).toBeUndefined();
    // protocol-relative would inherit the page scheme but its host is not us
    expect(cspSafeCover('//cdn.example/post.jpg', ORIGIN)).toBeUndefined();
  });

  it('drops empty and unparsable values', () => {
    expect(cspSafeCover(null, ORIGIN)).toBeUndefined();
    expect(cspSafeCover(undefined, ORIGIN)).toBeUndefined();
    expect(cspSafeCover('   ', ORIGIN)).toBeUndefined();
    expect(cspSafeCover('http://[bad', ORIGIN)).toBeUndefined();
  });
});

describe('readingMinutes', () => {
  it('never claims less than three minutes', () => {
    expect(readingMinutes('')).toBe(3);
    expect(readingMinutes(null)).toBe(3);
    expect(readingMinutes('کوتاه')).toBe(3);
  });

  it('rounds up at 150 words per minute', () => {
    const words = (n: number) => Array.from({ length: n }, () => 'کلمه').join(' ');
    expect(readingMinutes(words(151))).toBe(3); // ceil(151/150) = 2 → floor 3
    expect(readingMinutes(words(451))).toBe(4);
    expect(readingMinutes(words(1500))).toBe(10);
  });
});
