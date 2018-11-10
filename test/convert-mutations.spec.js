import convertMutations from '../src/convert-mutations';
import { SEPARATOR } from '../src/utils/const';

//eslint-disable-next-line
describe('convertMutations', () => {
  //正常运行的测试放前面
  it('should work correctly with `initialState`.', () => {
    let reducersAndCenters = convertMutations({
      namespace: 'test',
      initialState: null,
      reducers: {
        testReducer: function() {},
      },
      centers: {
        testCenter: function() {},
      },
    });
    reducersAndCenters.reducer.should.be.a('function');
    reducersAndCenters.centers.should.be.an('array');
    reducersAndCenters.centers[0].should.be.a('function');
  });
  it('should work correctly with `state`.', () => {
    let reducersAndCenters = convertMutations({
      namespace: 'test',
      state: null,
      reducers: {
        testReducer: function() {},
      },
      centers: {
        testCenter: function() {},
      },
    });
    reducersAndCenters.reducer.should.be.a('function');
    reducersAndCenters.centers.should.be.an('array');
    reducersAndCenters.centers[0].should.be.a('function');
  });

  it('should work correctly without centers and reducers.', () => {
    let reducersAndCenters = convertMutations({
      namespace: 'test',
      initialState: null,
    });
    reducersAndCenters.reducer.should.be.a('function');
    reducersAndCenters.centers.should.be.an('array');
    reducersAndCenters.centers[0].should.be.a('function');
  });

  it('should work correctly when centers and reducers is empty.', () => {
    let reducersAndCenters = convertMutations({
      namespace: 'test',
      initialState: null,
      reducers: {},
      centers: {},
    });
    reducersAndCenters.reducer.should.be.a('function');
    reducersAndCenters.centers.should.be.an('array');
    reducersAndCenters.centers[0].should.be.a('function');
  });

  it('should not throw error when centers or reducers property is not a function', () => {
    convertMutations({
      namespace: 'test',
      initialState: null,
      reducers: {
        test: 'dd',
      },
      centers: {
        test2: 'ddd',
      },
    });
  });

  it('should throw error when first param  is undefined', done => {
    try {
      convertMutations();
    } catch (e) {
      done();
    }
  });

  it('should throw error when the first params is [undefined]', done => {
    try {
      convertMutations([undefined]);
    } catch (e) {
      done();
    }
  });

  it('should throw error when the namespace is not defined', done => {
    try {
      convertMutations({
        initialState: null,
        reducers: {},
        centers: {},
      });
    } catch (e) {
      done();
    }
  });

  it('should throw error when namespace is repeated', done => {
    try {
      convertMutations([
        {
          initialState: null,
          namespace: 'test',
          reducers: {},
          centers: {},
        },
        {
          initialState: null,
          namespace: 'test',
          reducers: {},
          centers: {},
        },
      ]);
    } catch (e) {
      done();
    }
  });

  it('should throw error when the center name is repeated with with reducer', done => {
    try {
      convertMutations({
        namespace: 'test',
        initialState: null,
        reducers: { test: function() {} },
        centers: { test: function() {} },
      });
    } catch (e) {
      done();
    }
  });

  it('should throw error without `initialState` or `state`', done => {
    try {
      convertMutations({
        namespace: 'test',
        reducers: {},
        centers: {},
      });
    } catch (e) {
      done();
    }
  });
  it(`should throw error when reducer name contain "${SEPARATOR}"`, done => {
    try {
      convertMutations({
        namespace: 'test',
        initialState: null,
        reducers: {
          '/test': function() {},
        },
      });
    } catch (e) {
      done();
    }
  });

  it(`should throw error when center name contain "${SEPARATOR}"`, done => {
    try {
      convertMutations({
        namespace: 'test',
        initialState: null,
        centers: {
          '/test': function() {},
        },
      });
    } catch (e) {
      done();
    }
  });
});