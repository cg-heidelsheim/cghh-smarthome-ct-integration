const {shallowEqualsOn} = require('../../src/db/model/shallow-equals.util');

describe('shallowEqualsOn', () => {
  it('returns false when b is falsy', () => {
    expect(shallowEqualsOn({a: 1}, null, ['a'])).toBe(false);
    expect(shallowEqualsOn({a: 1}, undefined, ['a'])).toBe(false);
  });

  it('returns true when every listed field matches by strict equality', () => {
    expect(shallowEqualsOn({a: 1, b: 'x'}, {a: 1, b: 'x', c: 'ignored'}, ['a', 'b'])).toBe(true);
  });

  it('returns false when any listed field differs', () => {
    expect(shallowEqualsOn({a: 1, b: 'x'}, {a: 1, b: 'y'}, ['a', 'b'])).toBe(false);
  });

  it('ignores fields not listed', () => {
    expect(shallowEqualsOn({a: 1, unrelated: 'x'}, {a: 1, unrelated: 'y'}, ['a'])).toBe(true);
  });

  it('uses strict equality, not loose equality', () => {
    expect(shallowEqualsOn({a: '1'}, {a: 1}, ['a'])).toBe(false);
  });
});
