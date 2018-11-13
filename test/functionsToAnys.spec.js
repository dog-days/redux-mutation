import functionsToAnys from '../src/functionsToAnys';

describe('functionsToAnys', () => {
  it('run the function', () => {
    const mutation = {
      test: function() {
        return { a: 2 };
      },
      test2: '22',
    };
    const result = functionsToAnys(function() {
      return mutation;
    });
    expect(result).toEqual([mutation]);
  });
  it('run all the functions', () => {
    const mutation = {
      test: function() {
        return { a: 2 };
      },
      test2: '22',
    };
    const result = functionsToAnys([
      function() {
        return mutation;
      },
    ]);
    expect(result).toEqual([mutation]);
  });
});
