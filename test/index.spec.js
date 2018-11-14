import * as API from '../src';

describe('exports', () => {
  test('should be correct.', () => {
    const apis = Object.keys(API).filter(api => {
      if (api === '__esModule') {
        return false;
      }
      return true;
    });
    expect(apis.length).toBe(7);
    expect(apis).toContain('combineReducers');
    expect(apis).toContain('applyMiddleware');
    expect(apis).toContain('compose');
    expect(apis).toContain('createStore');
    expect(apis).toContain('configCreateStore');
    expect(apis).toContain('applyPlugin');
    expect(apis).toContain('SEPARATOR');
  });
});
