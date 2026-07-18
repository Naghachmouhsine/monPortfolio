import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { Lang, TranslateService } from '../../core/services/translation.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Clock, ShieldCheck, Globe, Send } from 'lucide-angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactComponent implements OnInit {
  loading = false;
  feedback: { type: 'success' | 'error'; message: string } | null = null;

  services: any[] = [];
  servicesRaw: any[] = [];
  contactForm: any;
  currentLang: Lang = 'ar';

  readonly icons = {
    clock: Clock,
    shield: ShieldCheck,
    globe: Globe,
    send: Send,
  };

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
    this.translate.lang$.subscribe((lang) => {
      this.currentLang = lang;
      this.reloadTranslations();
    });
  }

  initForm() {
    this.contactForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      service_interest: ['', Validators.required],
      subject: [''],
      message: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.initForm();

    await this.loadServices();

    this.route.queryParams.subscribe((params) => {
      const serviceId = params['idService'];

      if (serviceId) {
        this.contactForm.patchValue({
          service_interest: serviceId,
        });
      }
    });
  }

  async loadServices() {
    this.servicesRaw = await this.supabase.getServices();
    this.reloadTranslations();
  }

 private reloadTranslations(){

 this.services = this.servicesRaw.map((s)=>({

    id:s.id,

    title:s.title_i18n?.[this.currentLang]

 }));

 this.cdr.markForCheck();

}

  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  dismissFeedback(): void {
    this.feedback = null;
  }

  async submit() {
    this.feedback = null;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const ok = await this.supabase.createContact(this.contactForm.value);

    this.loading = false;

    if (ok) {
      this.feedback = {
        type: 'success',
        message: this.translate.translate('contact.success'),
      };
      this.contactForm.reset();
    } else {
      this.feedback = {
        type: 'error',
        message: this.translate.translate('contact.error'),
      };
    }

    this.cdr.markForCheck();
  }
}
