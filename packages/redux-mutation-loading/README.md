# Redux-Mutatio-Loading

`redux-mutation` loading 插件。

## 入门使用

### 安装

```js
npm install redux-mutation-loading --save
```

### 使用

默认所有命中 center 规则的 dispath 动作，都会触发 loading（mutation initialState 必须是 plain object）。

#### 默认触发 loading 

```js
import { configCreateStore, applyPlugin } from 'redux-mutation';
import createLoadingPlugin, { LOADINGNAMESPACE } from 'redux-mutation-loading';

import mutations, { counterNamespace } from './mutations';

const loadingPlugin = createLoadingPlugin();
const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

store.dispatch({ type: `${counterNamespace}/increment_async` });

store.subscribe(()=>{
  const loadingState = store.getState()[LOADINGNAMESPACE][counterNamespace];
  console.log(loadingState);
  // 第一次 undefined
  // 第二次 true
  // 第三次 true 
  // 第四次 false
})
```

mutations 代码如下：

```js
export const delayTime = 200;

// begin----counterMutation
export const counterNamespace = 'counter';
export const counterMutation = {
  namespace: counterNamespace,
  initialState: { count: 0 },
  reducers: {
    increment(state) {
      return {
        ...state,
        count: state.count + 1,
      };
    },
  },
  centers: {
    async increment_async(action, { put }) {
      await put({ type: 'increment' });
    },
  },
};
// end---counterMutation

export default [counterMutation];
```

#### 禁止触发 loading

```js
import { configCreateStore, applyPlugin } from 'redux-mutation';
import createLoadingPlugin, { LOADINGNAMESPACE } from 'redux-mutation-loading';

import mutations, { counterNamespace } from './mutations';

const loadingPlugin = createLoadingPlugin();
const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

store.dispatch({
  type: `${counterNamespace}/increment_async`,
  [LOADINGNAMESPACE]: false,
});

store.subscribe(()=>{
  const loadingState = store.getState()[LOADINGNAMESPACE][counterNamespace];
  console.log(loadingState);
  // 第一次 undefined
  // 第二次 undefined
})
```

如果自定义了 loading namespace，`LOADINGNAMESPACE` 也需要跟着变。

#### 使用 options

- `options.namespace`

  默认值可以通过 import 方式获取

  `import { LOADINGNAMESPACE } from 'redux-mutation-loading'`，值为 `$loading`。

可以自定义 loading namespace。

```js
import createLoadingPlugin from 'redux-mutation-loading';

const loadingPlugin = createLoadingPlugin( { namepace: '__loading__' } )
```

## 使用 loading 插件后 redux state 结构

loading namespace 默认值为 `$loading`

```js
$loading: {
  mutationNamespaceOne: false,
  mutationNamespaceTwo: false,
}
```

