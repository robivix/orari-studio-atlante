import { Routes } from '@angular/router';
import { InstructorsComponent } from './pages/instructors.component';
import { DaysComponent } from './pages/days.component';
import { TimesComponent } from './pages/times.component';
import { GroupComponent } from './pages/group.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: InstructorsComponent },
  { path: 'instructor/:name', component: DaysComponent },
  { path: 'instructor/:name/day/:day', component: TimesComponent },
  { path: 'instructor/:name/day/:day/time/:time', component: GroupComponent },
  { path: '**', redirectTo: '' }
];
