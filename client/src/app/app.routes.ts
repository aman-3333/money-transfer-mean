import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { CreateUserComponent } from './users/create-user/create-user';
import { HierarchyComponent } from './users/hierarchy/hierarchy';
import { TransferComponent } from './transactions/transfer/transfer';
import { HistoryComponent } from './transactions/history/history';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'create-user', component: CreateUserComponent },
    { path: 'hierarchy', component: HierarchyComponent },
    { path: 'transfer', component: TransferComponent },
    { path: 'history', component: HistoryComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
