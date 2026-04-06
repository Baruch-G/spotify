import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Callback } from './components/callback/callback';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { DiscDetails } from './components/disc-details/disc-details';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'home', component: Home },
  { path: 'disc/:id', component: DiscDetails },
  { path: 'dashboard', component: Dashboard },
  { path: 'callback', component: Callback },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
