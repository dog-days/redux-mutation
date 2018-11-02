# 新概念

`redux-mutation`比`redux`新增了两个概念。

## center

类似于`redux-saga`的`effects`概念，`redux-mutation`有个`center`概念。`center`跟`redux`的`reducer`很像，详细请看[redux-center](https://github.com/dog-days/redux-center)。

`center`函数可以是`async`函数，如果使用`generator`需要使用`redux-center`的`generatorsToAsync`工具函数转换。

### 例子

`center`函数例子：

```js
async function centerExample(action,{ put }){
  put({type: 'target'});
  //无需return
}
```

## mutationObject

`mutationObject`整合了reducers和centers。

### 结构定义

| 字段         | 类型   | 说明                                                  | 必填 |
| ------------ | ------ | :---------------------------------------------------- | ---- |
| namespace    | string | combineReducers参数中对象字段名                       | 是   |
| initailState | any    | reducer初始state，不可以是undefined                   | 是   |
| reducers     | object | 多个reducers，相当于switch的每个条件拆分后的reducer。 | 否   |
| centers      | object | 多个centers，相当于switch的每个条件拆分后的center。   | 否   |

- namespace

  combineReducers参数中对象字段名，如下：

  combineReducers({[namespace]:function(){}})

### 例子

`mutationObject`例子：

```js
[
  {
    namespace: 'test',
    //alias as state
    //state : {},
    initialState: {},
    reduers: {
      testReducer(state,action){
        return state;
      }
    },
    centers: {
     async testCenter(action,centeUtils){
        //无需return也可以
      }
    },
  },
  {
    namespace: 'test2',
    initialState: {},
    reduers: {},
    centers: {},
  }
]
```

因为有些场景需要保护变量，所有也兼容了函数方式：

```js
[
  function() {
    return {
      namespace: 'test',
      //alias as state
      //state : {},
      initialState: {},
      reducers: {},
      centers: {},
    };
  },
  function() {
    return {
      namespace: 'test2',
      //alias as state
      //state : {},
      initailState: {},
      reducers: {},
      centers: {},
    };
  },
];
```



