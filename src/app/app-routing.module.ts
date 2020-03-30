import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserAuthenticationComponent } from './auth/user-authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UnauthGuard } from './services/auth/unauth.guard';
import { AuthGuard } from './services/auth/auth.guard';

const routes: Routes = [
  { path: '', component: UserAuthenticationComponent, canActivate: [UnauthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
