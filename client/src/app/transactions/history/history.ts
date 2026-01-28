import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './history.html',
  styleUrls: ['./history.css'],
  encapsulation: ViewEncapsulation.None
})
export class HistoryComponent implements OnInit {
  displayedColumns: string[] = ['timestamp', 'type', 'sender', 'receiver', 'amount', 'description'];
  dataSource: any[] = [];

  constructor(private transactionService: TransactionService) { }

  ngOnInit() {
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.dataSource = data;
      },
      error: (err) => console.error(err)
    });
  }
}
