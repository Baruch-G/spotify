import { Routes } from '@angular/router';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { DiscDetails } from './components/disc-details/disc-details';

export const routes: Routes = [
  { path: 'register', component: Register },
  { path: 'home', component: Home },
  { path: 'disc/:id', component: DiscDetails },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: '**', redirectTo: '/register' }
];
