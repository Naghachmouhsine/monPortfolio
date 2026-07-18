import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService, Lang } from '../../core/services/translation.service';
import { SupabaseService, PortfolioService } from '../../core/services/supabase.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { BarChart, Brain, Code, LucideIconData, Settings, Smartphone, LucideAngularModule, Send } from 'lucide-angular';
import { Router } from '@angular/router';
interface ServiceView {
  id: number | string;
  title: string;
  description: string;
  icon: string;
}



@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, LucideAngularModule],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class Services implements OnInit {
  services: ServiceView[] = [];
  currentLang: Lang = 'ar';
  isLoading = true;
  loadError = false;

   icons: Record<string, LucideIconData> = {
    code: Code,
    smartphone: Smartphone,
    settings: Settings,
    brain: Brain,
    chart: BarChart,
    send : Send
  };


  private servicesRaw: PortfolioService[] = [];


  constructor(
    public translate: TranslateService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
     private router: Router
  ) {
    // Même logique que Projets : on remappe les données en mémoire
    // à chaque changement de langue, sans refaire d'appel réseau.
    this.translate.lang$.subscribe((lang) => {
      this.currentLang = lang;

      if (this.servicesRaw.length) {
        this.mapServices();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  retryLoad(): void {
    this.loadServices();
  }

  requestService(serviceId: string  | number){

  this.router.navigate(
    ['/contact'],
    {
      queryParams:{
        idService: serviceId
      }
    }
  );

}

  async loadServices(): Promise<void> {
    this.isLoading = true;
    this.loadError = false;

    try {
      const services = await this.supabaseService.getServices();
      this.servicesRaw = services ?? [];
      this.mapServices();

      if (!this.servicesRaw.length && services === null) {
        this.loadError = true;
      }
    } catch {
      this.loadError = true;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private mapServices(): void {
    this.services = this.servicesRaw.map((s) => ({
      id: s.id,
      title:
        s.title_i18n?.[this.currentLang] ??
        s.title_i18n?.en ??
        s.title_i18n?.fr,
      description:
        s.description_i18n?.[this.currentLang] ??
        s.description_i18n?.en ??
        s.description_i18n?.fr,
      icon: s.icon
    }));
  }

  /**
   * `icon` peut contenir soit une URL/chemin d'image, soit le nom
   * d'une classe d'icône (ex: bibliothèque d'icônes déjà chargée
   * globalement, type Bootstrap Icons / Font Awesome / Iconify).
   * Adapte cette méthode si ton système d'icônes est différent.
   */
  isImageIcon(icon: string): boolean {
    return !!icon && (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:'));
  }

}
