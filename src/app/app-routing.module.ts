import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { RequestComponent } from './db/request/request.component';
import { VisitorsComponent } from './db/visitors/visitors.component';
import { InviteComponent } from './invite/invite.component';
import { AuthComponent } from './auth/auth.component';
import { StartComponent } from './start/start.component';
import { AuthGuard } from '../app/auth.guard';

const routes: Routes = [
  { path: '', component: StartComponent},
  { path: 'auth', component: AuthComponent},
  { path: 'user/login', component: LoginComponent},
  { path: 'user/registration', component: RegistrationComponent},
  { path: 'db/request', component: RequestComponent},
  { path: 'db/visitors', component: VisitorsComponent, canActivate: [AuthGuard]},
  { path: 'invite', component: InviteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
