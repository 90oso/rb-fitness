const KEY = 'rb-last-email';

/** Last email used on this device, so the login form can prefill it. Storage may be blocked: never throws. */
export function readRememberedEmail(): string {
  try {
    return window.localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}
export function rememberEmail(email: string) {
  try {
    window.localStorage.setItem(KEY, email);
  } catch {
    // storage blocked: nothing to remember
  }
}
export function forgetRememberedEmail() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // storage blocked: nothing to forget
  }
}
