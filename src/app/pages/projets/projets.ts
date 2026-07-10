import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { TranslateService, Lang } from '../../core/services/translation.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projets.html',
  styleUrl: './projets.scss',
})
export class Projets implements OnInit {

  projects: any[] = [];
  currentLang: Lang = 'ar';
  isLoading = true;

constructor(
  public translate: TranslateService,
  private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
) {
  this.translate.lang$.subscribe(lang => {
    this.currentLang = lang;

    if (this.projects.length) {
      this.mapProjects();
    }
  });
}

ngOnInit(): void {
  this.loadProjects();
}

  // 🔥 LOAD DATA FROM SUPABASE
async loadProjects(): Promise<void> {
  this.isLoading = true;

  const projectsRaw = await this.supabaseService.getAllProjects();

  console.log("RAW FROM SUPABASE:", projectsRaw);

  this.projects = projectsRaw || [];

  console.log("AFTER ASSIGN:", this.projects);

  this.mapProjects();


  console.log("AFTER MAP:", this.projects);

  this.isLoading = false;

  this.cdr.detectChanges();


}

  // 🔥 MAP DATA FOR UI + i18n
  private mapProjects(): void {
    this.projects = this.projects.map(p => ({
      id: p.id,
      featured: p.featured,

      github_url : p.github_url,

      title: p.title_i18n?.[this.currentLang]
          || p.title_i18n?.en
          || p.title_i18n?.fr,

      description: p.description_i18n?.[this.currentLang]
          || p.description_i18n?.en
          || p.description_i18n?.fr,

      images: p.project_images || [],

      technologies: (p.project_technologies || []).map((t: any) => ({
        name: t.technologies?.name
      }))
    }));
  }

  // 🔥 MAIN IMAGE HELPER
  getMainImage(project: any): string {
    return project.images
      ?.sort((a: any, b: any) => a.order_index - b.order_index)
      ?.find((img: any) => img.is_main)?.image_url
      || project.images?.[0]?.image_url
      || 'assets/placeholder.png';
  }


lightboxOpen = false;
lightboxImage = '';

openLightbox(project: any, event: MouseEvent) {
  event.stopPropagation();
  this.lightboxImage = this.getActiveImage(project);
  this.lightboxOpen = true;
}

closeLightbox() {
  this.lightboxOpen = false;
}

openProject(project: any) {
  // navigation programmatique si besoin
}

private ensureCarouselState(project: any) {
  if (project.activeIndex === undefined) {
    project.activeIndex = 0;
  }
}

getActiveImage(project: any): string {
  this.ensureCarouselState(project);

  const images = project.images || [];
  return images.length
    ? images[project.activeIndex].image_url
    : 'assets/placeholder.png';
}

nextImage(project: any, event: MouseEvent) {
  event.stopPropagation();
  this.ensureCarouselState(project);

  project.activeIndex =
    (project.activeIndex + 1) % project.images.length;
}

prevImage(project: any, event: MouseEvent) {
  event.stopPropagation();
  this.ensureCarouselState(project);

  project.activeIndex =
    (project.activeIndex - 1 + project.images.length) %
    project.images.length;
}

/* Détection mobile screenshot */
isMobileImage(url: string): boolean {
  return url?.includes('mobile')
    || url?.includes('screenshot')
    || url?.includes('app');
}

}
