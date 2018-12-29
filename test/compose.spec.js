import compose from '../src/compose';

describe('compose', () => {
  describe('mutiple arguments', () => {
    // mutiple argument 的测试跟基于 redux compose 测试
    it('composes from right to left', () => {
      const plus = (x, y, z) => x + y + z;
      const multiplication = (x, y, z) => x * y * z;
      expect(compose(multiplication)(2, 2, 2)).toBe(8);
      expect(
        compose(
          plus,
          multiplication
        )(2, 2, 2)
      ).toBe(8 + 4);
      expect(
        compose(
          plus,
          multiplication,
          plus
        )(2, 2, 2)
      ).toBe(6 * 4 + 4);
    });
    it('composes functions from right to left', () => {
      const a = (next, y) => x => next(x + 'a' + y);
      const b = (next, y) => x => next(x + 'b' + y);
      const c = (next, y) => x => next(x + 'c' + y);
      const final = x => x;

      expect(
        compose(
          a,
          b,
          c
        )(final, ',')('$')
      ).toBe('$a,b,c,');
      expect(
        compose(
          b,
          c,
          a
        )(final, ',')('$')
      ).toBe('$b,c,a,');
      expect(
        compose(
          c,
          a,
          b
        )(final, ',')('$')
      ).toBe('$c,a,b,');
    });
  });
  describe('single argument', () => {
    // single argument 的测试跟 redux compose 测试完全一样
    // https://github.com/reduxjs/redux/blob/master/test/compose.spec.js
    it('composes from right to left', () => {
      const double = x => x * 2;
      const square = x => x * x;
      expect(compose(square)(5)).toBe(25);
      expect(
        compose(
          square,
          double
        )(5)
      ).toBe(100);
      expect(
        compose(
          double,
          square,
          double
        )(5)
      ).toBe(200);
    });

    it('composes functions from right to left', () => {
      const a = next => x => next(x + 'a');
      const b = next => x => next(x + 'b');
      const c = next => x => next(x + 'c');
      const final = x => x;

      expect(
        compose(
          a,
          b,
          c
        )(final)('')
      ).toBe('abc');
      expect(
        compose(
          b,
          c,
          a
        )(final)('')
      ).toBe('bca');
      expect(
        compose(
          c,
          a,
          b
        )(final)('')
      ).toBe('cab');
    });

    it('throws at runtime if argument is not a function', () => {
      const square = x => x * x;
      const add = (x, y) => x + y;

      expect(() =>
        compose(
          square,
          add,
          false
        )(1, 2)
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          undefined
        )(1, 2)
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          true
        )(1, 2)
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          NaN
        )(1, 2)
      ).toThrow();
      expect(() =>
        compose(
          square,
          add,
          '42'
        )(1, 2)
      ).toThrow();
    });

    it('can be seeded with multiple arguments', () => {
      const square = x => x * x;
      const add = (x, y) => x + y;
      expect(
        compose(
          square,
          add
        )(1, 2)
      ).toBe(9);
    });

    it('returns the first given argument if given no functions', () => {
      expect(compose()(1, 2)).toBe(1);
      expect(compose()(3)).toBe(3);
      expect(compose()()).toBe(undefined);
    });

    it('returns the first function if given only one', () => {
      const fn = () => {};

      expect(compose(fn)).toBe(fn);
    });
  });
});
