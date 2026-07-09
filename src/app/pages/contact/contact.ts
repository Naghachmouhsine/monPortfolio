import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { Lang, TranslateService } from '../../core/services/translation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactComponent implements OnInit {

  loading = false;

  services: any[] = [];
servicesRaw : any[] = [];
  contactForm : any;
  currentLang: Lang = 'ar';

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
        public translate: TranslateService,
            private cdr: ChangeDetectorRef


  ) {

      this.translate.lang$.subscribe(lang => {
      this.currentLang = lang;
      this.reloadTranslations(); // 🔥 important
    });

  }


  initForm(){
    this.contactForm = this.fb.group({

    full_name: ['', Validators.required],

    email: ['', [Validators.required, Validators.email]],

    phone: [''],

    service_interest: ['', Validators.required],

    subject: [''],

    message: ['', Validators.required]

  });
  }


 async ngOnInit() {

  this.initForm();

  await this.loadServices();

}

 async loadServices() {

  this.servicesRaw = await this.supabase.getServices();

  this.reloadTranslations();

}


    private reloadTranslations(): void {


    this.services = this.servicesRaw.map(s => ({
      title: s.title_i18n?.[this.currentLang]
    }));

          this.cdr.markForCheck();


    console.log(this.services);


  }

  async submit() {

    if (this.contactForm.invalid) {

      this.contactForm.markAllAsTouched();

      return;

    }

    this.loading = true;

    const ok = await this.supabase.createContact(
      this.contactForm.value
    );

    this.loading = false;

    if (ok) {

      alert(this.translate.translate('contact.success'));

      this.contactForm.reset();

    } else {

           alert(this.translate.translate('contact.error'));


    }

  }

}
