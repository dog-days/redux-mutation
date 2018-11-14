import { checkActionType, isObjectEmpty } from '../../src/utils/util';

describe('util', () => {
  it('uses checkActionType', () => {
    const errString = 'Expect the action type to be a string';
    function checkType(type) {
      checkActionType({ type });
    }
    expect(() => checkType(1)).toThrowError(errString);
    expect(() => checkType(null)).toThrowError(errString);
    expect(() => checkType(undefined)).toThrowError(errString);
    expect(() => checkType(() => {})).toThrowError(errString);
    expect(() => checkType([])).toThrowError(errString);
    expect(() => checkType({})).toThrowError(errString);
    expect(() => checkType('')).not.toThrowError();
  });
  it('uses isObjectEmpty', () => {
    expect(isObjectEmpty({})).toBe(true);
    expect(isObjectEmpty({ a: 2 })).toBe(false);
    expect(isObjectEmpty({ a: 2, b: 3 })).toBe(false);
    const errString = 'Expect the object to be a plain object';
    expect(() => isObjectEmpty()).toThrowError(errString);
    expect(() => isObjectEmpty(1)).toThrowError(errString);
    expect(() => isObjectEmpty(null)).toThrowError(errString);
    expect(() => isObjectEmpty(() => {})).toThrowError(errString);
    expect(() => isObjectEmpty([])).toThrowError(errString);
    expect(() => isObjectEmpty('')).toThrowError(errString);
  });
});
