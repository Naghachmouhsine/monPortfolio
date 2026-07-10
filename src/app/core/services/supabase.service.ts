import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

export interface SiteSettings {
  site_name_i18n: any;
  full_name_i18n: any;
  role_i18n: any;
  bio_short_i18n: any;
}

export interface PortfolioService {
  id: number | string;
  title_i18n: any;
  description_i18n: any;
  icon: string;
}

export interface FeaturedProject {
  id: number | string;
  title_i18n: any;
  description_i18n: any;
  featured: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly supabaseUrl = 'https://yvxrnppfqjgwdivjzoxc.supabase.co';
  private readonly supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eHJucHBmcWpnd2Rpdmp6b3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDg3NTksImV4cCI6MjA5NjUyNDc1OX0.n2wqhOAX6Rodcl2s9xN8ki7VUZ95UVVJOslNWa6JO_g';
  private readonly client: SupabaseClient | null = this.createSupabaseClient();

  async getSiteSettings(): Promise<SiteSettings | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('site_settings')
      .select('site_name_i18n, full_name_i18n, role_i18n, bio_short_i18n')
      .limit(1)
      .maybeSingle<SiteSettings>();

    if (error || !data) return null;

    return data;
  }

  async getServices(): Promise<PortfolioService[]> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('services')
      .select('id, title_i18n, description_i18n, icon')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error || !data) return [];

    return data as PortfolioService[];
  }

async getAllProjects(): Promise<any[]> {
  if (!this.client) return [];

  const { data, error } = await this.client
    .from('projects')
    .select(`
      id,
      title_i18n,
      description_i18n,
      featured,
      github_url,
      project_images (
        image_url,
        is_main,
        order_index
      ),
      project_technologies (
        technologies (
          name
        )
      )
    `)
    .order('order_index', { ascending: true });

  if (error || !data) {
    console.error('getAllProjects error:', error);
    return [];
  }

  return data;
}

  async getProjectsByIds(ids: string[]): Promise<FeaturedProject[]> {
  if (!this.client || !ids?.length) return [];

  const { data, error } = await this.client
    .from('projects')
    .select('id, title_i18n, description_i18n, featured')
    .in('id', ids);

  if (error || !data) {
    console.error('getProjectsByIds error:', error);
    return [];
  }

  return data as FeaturedProject[];
}

  private createSupabaseClient(): SupabaseClient | null {
    if (!this.supabaseUrl || !this.supabaseAnonKey) return null;

    return createClient(this.supabaseUrl, this.supabaseAnonKey);
  }


async createContact(contact: any): Promise<boolean> {

  if(!this.client) return false ;

  const { error } = await this.client
    .from("contacts")
    .insert(contact);

  if (error) {

    console.error(error);

    return false;

  }

  return true;

}

}
