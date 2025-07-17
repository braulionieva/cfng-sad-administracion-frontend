import { inject } from '@angular/core';
import {
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  Router,
  CanActivateFn,
} from '@angular/router';
import { TokenService } from '../services/shared/token.service';

export const isUnauthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.exist()) {
    return true;
  }

  router.navigateByUrl('/app');
  return false;
};
