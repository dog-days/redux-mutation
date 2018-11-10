import functionsToAnys from '../src/functions-to-anys';

describe('functionsToAnys', () => {
  it('should work correctly with param which is a function', () => {
    const mutation = {
      test: function() {
        return { a: 2 };
      },
      test2: '22',
    };
    const result = functionsToAnys(function() {
      return mutation;
    });
    result.should.deep.equal([mutation]);
  });
  it('should work correctly with param which is a array', () => {
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
    result.should.deep.equal([mutation]);
  });
});
