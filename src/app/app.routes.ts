import { Routes } from '@angular/router';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { DiscDetails } from './components/disc-details/disc-details';
import { Collection } from './components/collection/collection';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'register', component: Register },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'disc/:id', component: DiscDetails, canActivate: [authGuard] },
  { path: 'collection', component: Collection, canActivate: [authGuard] },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: '**', redirectTo: '/register' }
];
