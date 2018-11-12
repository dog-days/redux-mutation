export default function(state = 0, action) {
  switch (action.type) {
    case 'increment':
      return state + 1;
    default:
      return state;
  }
}

export function replacedReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return state + 3;
    case 'decrement':
      return state - 3;
    default:
      return state;
  }
}
