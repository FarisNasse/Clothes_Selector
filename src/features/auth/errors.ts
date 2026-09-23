type AuthProblem = {
  message?: string | undefined;
  name?: string | undefined;
  status?: number | undefined;
};

export function friendlyAuthError(
  problem: AuthProblem | null,
  action: 'sign-in' | 'sign-up' | 'reset' | 'update',
) {
  if (!problem) return null;
  const message = problem.message?.toLowerCase() ?? '';
  if (
    problem.name === 'AuthRetryableFetchError' ||
    /failed to fetch|network request failed|fetch failed/.test(message)
  ) {
    return 'We could not reach the account service. Check your connection and the Supabase project status, then try again.';
  }
  if (/rate limit|too many requests/.test(message)) {
    return 'Too many attempts were made. Wait a few minutes, then try again.';
  }
  if (/password.*(weak|short)|at least .* characters/.test(message)) {
    return 'Use a password with at least 8 characters.';
  }
  if (/email.*not confirmed/.test(message)) {
    return 'Confirm your email first, then come back to sign in.';
  }
  if (action === 'sign-in' && /invalid login credentials/.test(message)) {
    return 'That email and password did not match. Try again or reset your password.';
  }
  if (action === 'sign-up' && /already.*registered|already exists/.test(message)) {
    return 'An account may already use this email. Sign in or reset its password.';
  }
  if (action === 'reset') return 'We could not send the reset email. Please try again.';
  if (action === 'update')
    return 'We could not change your password. Open a fresh reset link and try again.';
  return action === 'sign-in'
    ? 'We could not sign you in. Check your details and try again.'
    : 'We could not create this account. Check your details and try again.';
}
