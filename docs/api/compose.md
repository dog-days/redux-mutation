# compose

```js
(...functions) => () => {}
```

从右到左合成多个参数的函数，基于 [redux compose](从右到左合成多个参数的函数，基于redux compose改造而来) 改造而来。跟 `redux` 的 `compose` 区别在于，这里合并的函数是可以多个参数的，除了第一个参数一定是函数外，其他参数无限制。

多参数 `compose` 可以兼容 `redux` 的单个参数 `compose`。

#### 参数

1. (_arguments_): 需要被合成的函数， 例如 `compose(f, g, h)`  合成如下面的:

   `(firstArg,...otherArgs) => f(g(h(firstArg,...otherArgs),...otherArgs),...otherArgs)`

#### 返回值

(*function*): 从右到左把接收到的函数合成后的最终函数。
