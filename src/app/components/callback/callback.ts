import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="callback-container animate-fade-in">
      <div class="loader"></div>
      <p>Authenticating (PKCE)...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: var(--spotify-green);
    }
    .loader {
      border: 4px solid var(--glass-border);
      border-top: 4px solid var(--spotify-green);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class Callback implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      try {
        await this.authService.handleCallback(code);
        this.router.navigate(['/home']);
      } catch (err) {
        console.error('Failed to handle callback', err);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
