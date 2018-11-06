import functionsToAnys from '../src/functions-to-anys';

describe('functionsToAnys', () => {
  it('should work correctly with param which is a function', () => {
    const mutationObject = {
      test: function() {
        return { a: 2 };
      },
      test2: '22',
    };
    const result = functionsToAnys(function() {
      return mutationObject;
    });
    result.should.deep.equal([mutationObject]);
  });
  it('should work correctly with param which is a array', () => {
    const mutationObject = {
      test: function() {
        return { a: 2 };
      },
      test2: '22',
    };
    const result = functionsToAnys([
      function() {
        return mutationObject;
      },
    ]);
    result.should.deep.equal([mutationObject]);
  });
});
