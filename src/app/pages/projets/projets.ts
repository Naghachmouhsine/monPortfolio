import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { TranslateService, Lang } from '../../core/services/translation.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './projets.html',
  styleUrl: './projets.scss'
})
export class Projets implements OnInit {
  @ViewChild('lightboxCloseBtn') lightboxCloseBtn?: ElementRef<HTMLButtonElement>;

  projects: any[] = [];
  currentLang: Lang = 'ar';
  isLoading = true;
  loadError = false;

  private projectsRaw: any[] = [];

  lightboxOpen = false;
  lightboxImage = '';
  lightboxAlt = '';
  private lightboxTrigger: HTMLElement | null = null;

  constructor(
    public translate: TranslateService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.translate.lang$.subscribe((lang) => {
      this.currentLang = lang;
      console.log("lang : ",this.currentLang)
      console.log("prjs : ",this.projects)
     this.translate.lang$.subscribe(lang => {
    this.currentLang = lang;

    if (this.projectsRaw.length) {
        this.mapProjects();
        this.cdr.markForCheck();
    }
});
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  retryLoad(): void {
    this.loadProjects();
  }

  async loadProjects(): Promise<void> {
    this.isLoading = true;
    this.loadError = false;

    try {
    const projects = await this.supabaseService.getAllProjects();

this.projectsRaw = projects ?? [];
this.mapProjects();

      if (!this.projectsRaw) {
        this.loadError = true;
      }
    } catch {
      this.loadError = true;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

private mapProjects(): void {
  this.projects = this.projectsRaw.map((p) => ({
    id: p.id,
    featured: p.featured,
    github_url: p.github_url,

    title:
      p.title_i18n?.[this.currentLang] ??
      p.title_i18n?.en ??
      p.title_i18n?.fr,

    description:
      p.description_i18n?.[this.currentLang] ??
      p.description_i18n?.en ??
      p.description_i18n?.fr,

    images: p.project_images ?? [],

    technologies: (p.project_technologies ?? []).map((t: any) => ({
      name: t.technologies?.name
    }))
  }));
}

  getMainImage(project: any): string {
    return (
      project.images
        ?.sort((a: any, b: any) => a.order_index - b.order_index)
        ?.find((img: any) => img.is_main)?.image_url ||
      project.images?.[0]?.image_url ||
      '/placeholder.svg'
    );
  }

  openLightbox(project: any, event: MouseEvent) {
    event.stopPropagation();
    this.lightboxTrigger = event.currentTarget as HTMLElement;
    this.lightboxImage = this.getActiveImage(project);
    this.lightboxAlt = project.title;
    this.lightboxOpen = true;

    setTimeout(() => this.lightboxCloseBtn?.nativeElement.focus());
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxTrigger?.focus();
    this.lightboxTrigger = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.lightboxOpen) {
      this.closeLightbox();
    }
  }

  openProject(project: any) {
    this.lightboxImage = this.getActiveImage(project);
    this.lightboxAlt = project.title;
    this.lightboxOpen = true;
    setTimeout(() => this.lightboxCloseBtn?.nativeElement.focus());
  }

  private ensureCarouselState(project: any) {
    if (project.activeIndex === undefined) {
      project.activeIndex = 0;
    }
  }

  getActiveImage(project: any): string {
    this.ensureCarouselState(project);

    const images = project.images || [];
    return images.length ? images[project.activeIndex].image_url : '/placeholder.svg';
  }

  getImageAlt(project: any): string {
    const index = project.activeIndex ?? 0;
    return `${project.title} — ${index + 1}/${project.images?.length || 1}`;
  }

  nextImage(project: any, event: MouseEvent) {
    event.stopPropagation();
    this.ensureCarouselState(project);

    if (!project.images?.length) {
      return;
    }

    project.activeIndex = (project.activeIndex + 1) % project.images.length;
  }

  prevImage(project: any, event: MouseEvent) {
    event.stopPropagation();
    this.ensureCarouselState(project);

    if (!project.images?.length) {
      return;
    }

    project.activeIndex =
      (project.activeIndex - 1 + project.images.length) % project.images.length;
  }

  goToImage(project: any, index: number, event: MouseEvent) {
    event.stopPropagation();
    project.activeIndex = index;
  }

  isMobileImage(url: string): boolean {
    return url?.includes('mobile') || url?.includes('screenshot') || url?.includes('app');
  }
}
