export default async function center(action, { put }) {
  switch (action.type) {
    case '@@test':
      await put({ type: 'increment' });
      break;
    default:
  }
}

export async function replacedCenter(action, { put }) {
  switch (action.type) {
    case '@@test':
      await put({ type: 'decrement' });
      break;
    default:
  }
}
