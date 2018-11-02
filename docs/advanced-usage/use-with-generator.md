# 兼容 generator 用法

这里是指兼容`mutationObject`中的`centers`的 generator用法。那么需要用到`createMutationStore`和`redux-center`的`generatorsToAsync`。

```js
import { createMutationStore } from 'redux-mutation';
import generatorsToAsync from 'redux-center/lib/generators-to-async';

const mutationObjects = [
  {
    //state: 0,也可以
    initialState: 0,
    namespace: 'counter',
    centers: {
      *increment(action, { put }) {
      	yield put({ type: 'loading' });
      },
    },
  },
];
const store = createMutationStore({ generatorsToAsync })(mutationObjects);
```

