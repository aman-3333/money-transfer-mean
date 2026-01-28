import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './transfer.html',
  styleUrls: ['./transfer.css']
})
export class TransferComponent implements OnInit {
  transferForm: FormGroup;
  directChildren: any[] = [];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.transferForm = this.fb.group({
      receiverId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Require direct children for Normal Users. 
    // If Admin, they can transfer to anyone, so maybe fetch all downline?
    // Requirement: "Credit balance to their next-level users only" (User)
    // "Credit balance to any user in the hierarchy" (Admin)
    // I need to check role to decide what list to populate.
    // Ideally I should get role from AuthService or User Profile.
    this.userService.getProfile().subscribe(user => {
      if (user.role === 'admin') {
        this.userService.getDownline().subscribe(users => {
          this.directChildren = users; // Show all users for admin
        });
      } else {
        this.userService.getChildren().subscribe(users => {
          this.directChildren = users;
        });
      }
    });
  }

  onSubmit() {
    if (this.transferForm.valid) {
      this.transactionService.transfer(this.transferForm.value).subscribe({
        next: () => {
          this.snackBar.open('Transfer successful', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.snackBar.open(err.error.message || 'Transfer failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
