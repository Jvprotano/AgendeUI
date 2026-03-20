import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageUtils } from '../../utils/localstorage';
import { isTokenExpired } from '../../utils/token.utils';
import { RedirectService } from '../../services/redirect.service';

/**
 * Blocks /account/login and /account/register for users who are already
 * logged in with a valid (non-expired) token → redirects to /home.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorageUtils = inject(LocalStorageUtils);

  const token = localStorageUtils.getUserToken();
  if (token && !isTokenExpired(token)) {
    router.navigate(['/home']);
    return false;
  }

  // Token missing or expired — allow access to login/register
  if (token) {
    localStorageUtils.clearUserLocalData();
  }
  return true;
};

/**
 * Blocks /user/* and /company/* routes for unauthenticated or expired-token
 * users → saves the intended URL for post-login redirect, then sends to login.
 */
export const protectedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorageUtils = inject(LocalStorageUtils);
  const redirectService = inject(RedirectService);

  const token = localStorageUtils.getUserToken();

  if (token && !isTokenExpired(token)) {
    return true;
  }

  // Token missing or expired — clean up and redirect
  if (token) {
    localStorageUtils.clearUserLocalData();
  }

  redirectService.setReturnRoute(state.url);
  router.navigate(['/account/login']);
  return false;
};
