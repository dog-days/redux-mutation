/**
 * Prints a warning in the console if it exists in non-production environment.
 *
 * @param {string} message The warning message.
 * @returns {void}
 */
export default function warning(message) {
  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(message);
    }
    /* eslint-enable no-console */
    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
    } catch (e) {} // eslint-disable-line no-empty
  }
}
