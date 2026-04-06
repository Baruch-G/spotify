import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { switchMap, from, catchError, throwError } from 'rxjs';

export const spotifyInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Allow the token exchange request to pass untouched
  if (req.url.includes('/api/token')) {
    return next(req);
  }

  const token = authService.accessToken();

  // If we already hold a token in Signal state, attach it and proceed
  if (token && req.url.startsWith('https://api.spotify.com')) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If Spotify explicitly rejects the token as expired (401)
        if (error.status === 401) {
          return from(authService.fetchToken()).pipe(
            switchMap(() => {
              const refreshedToken = authService.accessToken();
              const retryReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${refreshedToken}`)
              });
              return next(retryReq);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  // If we don't have a token yet (e.g. initial bootup), await the fetchToken promise before sending request
  if (!token && req.url.startsWith('https://api.spotify.com')) {
    return from(authService.fetchToken()).pipe(
      switchMap(() => {
        const fetchedToken = authService.accessToken();
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${fetchedToken}`)
        });
        return next(clonedReq);
      })
    );
  }

  return next(req);
};
