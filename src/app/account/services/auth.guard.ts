import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageUtils } from '../../utils/localstorage';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorage = inject(LocalStorageUtils);

  if (localStorage.getUserToken()) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};

export const protectedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorage = inject(LocalStorageUtils);

  if (!localStorage.getUserToken()) {
    router.navigate(['/account/login']);
    return false;
  }

  return true;
};
