import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translation.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFoundComponent {
  constructor(public translate: TranslateService) {}
}
