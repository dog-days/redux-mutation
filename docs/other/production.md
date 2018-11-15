# 生产环境

开发环境下，`redux-mutation`会提供很多警告来帮你对付常见的错误与陷阱。而在生产环境下，这些警告语句却没有用，反而会增加应用的体积。此外，有些警告检查还有一些小的运行时开销，这在生产环境模式下是可以避免的。

## 开启生产环境

### 不使用构建工具

如果用`redux-mutation`，开发环境即直接用 `<script>` 元素引入 `redux-mutation.js` 。请记得在生产环境下使用压缩后的版本 (`redux-mutation.min.js`)进行替换。两种版本都可以在[在浏览器中使用 umd 方式](../../README.md#zai-lan-qi-zhong-shi-yong-umd-fang-shi)中找到。

### 使用构建工具

#### Webpack

在 webpack 4+ 中，你可以使用 `mode` 选项：

```js
module.exports = {
  mode: 'production'
};
```

但是在 webpack 3 及其更低版本中，你需要使用 [DefinePlugin](https://webpack.js.org/plugins/define-plugin/)：

```js
var webpack = require('webpack')

module.exports = {
  // ...
  plugins: [
    // ...
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
}
```

#### Browserify

- 在运行打包命令时将 `NODE_ENV` 设置为 `"production"`。这等于告诉 `vueify` 避免引入热重载和开发相关的代码。
- 对打包后的文件进行一次全局的 [envify](https://github.com/hughsk/envify) 转换。这使得压缩工具能清除掉 Vue 源码中所有用环境变量条件包裹起来的警告语句。例如：

```
NODE_ENV=production browserify -g envify -e main.js | uglifyjs -c -m > build.js
```

- 或者在 Gulp 中使用 [envify](https://github.com/hughsk/envify)：

  ```js
  // 使用 envify 的自定义模块来定制环境变量
  var envify = require('envify/custom')
  
  browserify(browserifyOptions)
    .transform(vueify)
    .transform(
      // 必填项，以处理 node_modules 里的文件
      { global: true },
      envify({ NODE_ENV: 'production' })
    )
    .bundle()
  ```

- 或者配合 Grunt 和 [grunt-browserify](https://github.com/jmreidy/grunt-browserify) 使用 [envify](https://github.com/hughsk/envify)：

  ```js
  // 使用 envify 自定义模块指定环境变量
  var envify = require('envify/custom')
  
  browserify: {
    dist: {
      options: {
          // 该函数用来调整 grunt-browserify 的默认指令
          configure: b => b
          .transform('vueify')
          .transform(
              // 用来处理 `node_modules` 文件
            { global: true },
            envify({ NODE_ENV: 'production' })
          )
          .bundle()
      }
    }
  }
  ```

#### Rollup

使用 [rollup-plugin-replace](https://github.com/rollup/rollup-plugin-replace)：

```js
const replace = require('rollup-plugin-replace')
rollup({
  // ...
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    })
  ]
}).then(...)
```