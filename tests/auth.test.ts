import assert from 'node:assert/strict';
import test from 'node:test';
import { friendlyAuthError } from '../src/features/auth/errors';

test('auth errors distinguish outages from account and password problems', () => {
  assert.match(
    friendlyAuthError({ name: 'AuthRetryableFetchError', message: 'Failed to fetch' }, 'sign-in')!,
    /account service/,
  );
  assert.match(
    friendlyAuthError({ message: 'Invalid login credentials' }, 'sign-in')!,
    /reset your password/,
  );
  assert.match(
    friendlyAuthError({ message: 'Password should be at least 6 characters' }, 'sign-up')!,
    /at least 8/,
  );
  assert.match(friendlyAuthError({ message: 'email rate limit exceeded' }, 'reset')!, /Wait/);
  assert.equal(friendlyAuthError(null, 'sign-in'), null);
});
