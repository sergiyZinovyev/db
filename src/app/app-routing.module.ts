import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { VisitorsComponent } from './db/visitors/visitors.component';
import { DashboardComponent } from './db/dashboard/dashboard.component';
import { InviteComponent } from './invite/invite.component';
import { AuthComponent } from './auth/auth.component';
import { StartComponent } from './start/start.component';
import { AuthGuard } from '../app/auth.guard';
import { DbComponent } from './db/db.component';

const routes: Routes = [
  { path: '', component: StartComponent},
  { path: 'auth', component: AuthComponent},
  { path: 'user/login', component: LoginComponent},
  { path: 'user/registration', component: RegistrationComponent},
 // { path: 'db/visitors', component: VisitorsComponent, canActivate: [AuthGuard]},
  //{ path: 'db/dashboard', component: DashboardComponent, canActivate: [AuthGuard]}, 
  { path: 'invite', component: InviteComponent},
  { path: 'db', component: DbComponent, canActivate: [AuthGuard], children: [
    {path: 'visitors', component: VisitorsComponent, canActivate: [AuthGuard]},
    {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]}
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
