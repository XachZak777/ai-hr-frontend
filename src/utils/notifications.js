export function notify(message, type = 'info') {
  window.dispatchEvent(new CustomEvent('hireai:notify', { detail: { message, type } }));
}
