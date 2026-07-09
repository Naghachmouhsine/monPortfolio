import { Component, OnInit } from '@angular/core';
import { TranslateService } from '../../core/services/translation.service';
import { LanguageService } from '../../core/services/language.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbare/navbar.component';

@Component({
  selector: 'app-layout',
  imports : [RouterOutlet,NavbarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {



  constructor(

  ) {}


}
