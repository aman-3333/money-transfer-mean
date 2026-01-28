import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  hidePassword = true;
  loginForm: FormGroup;
  captchaSvg: any;
  captchaId: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      captchaValue: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getCaptcha();
  }

  getCaptcha() {
    this.authService.getCaptcha().subscribe({
      next: (res) => {
        this.captchaId = res.captchaId;
        // Sanitize SVG
        this.captchaSvg = this.sanitizer.bypassSecurityTrustHtml(res.svg);
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password, captchaValue } = this.loginForm.value;
      const payload = {
        username,
        password,
        captchaId: this.captchaId,
        captchaValue
      };

      this.authService.login(payload).subscribe({
        next: (user) => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Login failed';
          this.getCaptcha(); // Refresh captcha on failure
          this.loginForm.patchValue({ captchaValue: '' });
        }
      });
    }
  }
}
