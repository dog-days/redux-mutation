# 新术语

`redux`术语看[这里](https://redux.js.org/glossary)，相对于`redux`，`redux-mutation`新增了下面的术语。

## Center

```js
type Center<A, C, M, T> = (action: A, centerUtils: C, mutationObject: M, actionType: T) => void
```

`redux-center`里的`center`,`center`可以进行异步操作、延迟`dispatch`。

## Mutation object

```js
type mutationObject = object | function
```

`mutationObject`是一种结构，整合了`reducer`和`center`，具体定义可以看[新概念](../introduction/new-concepts.md)中的`mutaionObject`定义。

## Reducer enhancer

```js
type ReducerEnhancer<R = Reducer> = (originalReducer: Reducer) => originalReducer
```

`reducerEnhancer`需要配合[applyPlugin](../api/applyPlugin.md)使用，插件选项之一。可拦截state的返回值，进行一些state的增删改等操作。必须返回原有的reducer，否则整个reducer将失效。

## Center enhancer

```js
type ReducerEnhancer<C = Center> = (center: Center) => center
```

`centerEnhancer`需要配合[applyPlugin](../api/applyPlugin.md)使用，插件选项之一。可以在`center`运行之前或者之后进行`disaptch`等操作，同时也可以根据`action type`过滤`center`操作。