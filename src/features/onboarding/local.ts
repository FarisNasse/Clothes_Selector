const key = 'clothes-selector:introduction:v1';
export function hasSeenOnboarding() {
  try { return localStorage.getItem(key) === 'seen'; } catch { return true; }
}
export function completeOnboarding() {
  try { localStorage.setItem(key, 'seen'); } catch { /* Continue this session. */ }
}
