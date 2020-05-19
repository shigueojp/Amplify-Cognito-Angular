import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserAuthenticationComponent } from './auth/user-authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UnauthGuard } from './services/auth/unauth.guard';
import { AuthGuard } from './services/auth/auth.guard';
import { UserRegisteredComponent } from './auth/user-registered.component';
import { StorageComponent } from './storage/storage.component';

const routes: Routes = [
  { path: 'login/verified', component: UserRegisteredComponent },
  { path: 'login', component: UserAuthenticationComponent, canActivate: [UnauthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'storage', component: StorageComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
