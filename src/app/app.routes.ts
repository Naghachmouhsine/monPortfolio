import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout.component';
import { HomeComponent } from './pages/home/home';
import { Projets } from './pages/projets/projets';
import { ContactComponent } from './pages/contact/contact';

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
        component : Projets
      },

      {
        path : "contact",
        component : ContactComponent
      }

    ]
  },

  // fallback route
  {
    path: '**',
    redirectTo: ''
  }
];
