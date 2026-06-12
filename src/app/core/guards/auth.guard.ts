import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return authService.checkSession().pipe(
    tap(valid => {
      if (!valid) {
        router.navigate(['/login']);
      }
    }),
    map(valid => valid)
  );
};