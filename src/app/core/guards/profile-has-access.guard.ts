import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { SYSTEM_CODE } from '@environments/environment';
import { modules } from 'src/app/shared/constants/modules';
import { findModuleNameByCode } from 'src/app/shared/utils/modules';
import { TokenService } from '../services/shared/token.service';

export const profileHasAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const _tokenDecoded: any = tokenService.getDecoded();
  const _user = _tokenDecoded.usuario;
  const _system = _user.sistemas.find((system: any) => system.codigo === SYSTEM_CODE);
  const _hasAccess = _system.opciones.includes(route.data['module']);

  if (_hasAccess) {
    return true;
  }

  if (_system.opciones.length === 0) {
    router.navigateByUrl('/app/no-encontrado');
  } else {
    let _moduleName = findModuleNameByCode(modules, _system.opciones[0]);
    router.navigateByUrl(`/app/${_moduleName}`);
  }

  return false;
};
