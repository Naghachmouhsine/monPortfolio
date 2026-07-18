import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout.component';
import { HomeComponent } from './pages/home/home';
import { Projets } from './pages/projets/projets';
import { ContactComponent } from './pages/contact/contact';
import { NotFoundComponent } from './pages/not-found/not-found';
import { Services } from './pages/services/services';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'projects',
        component: Projets
      },
      {
        path: 'contact',
        component: ContactComponent
      },
      {
        path : "services",
        component : Services
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]
  }
];
