import { inject } from "@angular/core";
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { TokenService } from "@services/shared/token.service";

export const isAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.exist()) {
    return true;
  }

  router.navigateByUrl('/auth/login');
  return false;
};
