import applyPlugin, { compose } from '../src/apply-plugin';
import isPlainObject from '../src/utils/isPlainObject';

describe('applyPlugin', () => {
  it('should work when plugins is undefined', () => {
    applyPlugin();
  });
  it('should work correctly when plugins is empty', () => {
    const pluginObject = applyPlugin({});
    //eslint-disable-next-line
    isPlainObject(pluginObject.extraReducers).should.be.true;
    pluginObject.extraCenters.should.be.an('array');
    pluginObject.reducerEnhancer.should.be.a('function');
    pluginObject.centerEnhancer.should.be.a('function');
  });
  it('should work correctly when plugins is not empty', () => {
    const pluginObject = applyPlugin(
      {
        extraReducers: { test: function() {} },
        extraCenters: [function() {}],
      },
      {
        extraReducers: { test2: function() {} },
        extraCenters: [function() {}],
      }
    );
    //eslint-disable-next-line
    isPlainObject(pluginObject.extraReducers).should.be.true;
    pluginObject.extraReducers.test.should.be.a('function');
    pluginObject.extraReducers.test2.should.be.a('function');
    pluginObject.extraCenters.should.be.an('array');
    pluginObject.extraCenters[0].should.be.a('function');
    pluginObject.reducerEnhancer.should.be.a('function');
    pluginObject.centerEnhancer.should.be.a('function');
  });
  it('should work correctly using compose with empty arguments', () => {
    compose()('test').should.equal('test');
  });
});
