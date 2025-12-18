import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { EditRegistrationComponent } from './edit-registration/edit-registration.component';
import { AdminComponent } from './admin/admin.component';
import { StudentsComponent } from './students/students.component';
import { ViewStudentsComponent } from './view-students/view-students.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  {
    path: 'students/:childId',
    component: ViewStudentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'students',
    component: StudentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-registration',
    component: EditRegistrationComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/login' },
];
