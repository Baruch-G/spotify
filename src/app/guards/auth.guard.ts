import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isRegistered = localStorage.getItem('is_registered') === 'true';
  
  if (!isRegistered) {
    router.navigate(['/register']);
    return false;
  }
  return true;
};
