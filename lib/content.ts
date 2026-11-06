import source from '../content/site.json';
import routeSource from '../content/routes.json';

export type Page = Record<string, any>;
export const pages: Page[] = source.pages;
export const services = pages.filter(p => p.type === 'service');
export const sectors = pages.filter(p => p.type === 'icp');
export const resources = pages.filter(p => p.type === 'resource');
export const posts = pages.filter(p => p.type === 'blog_post');
export const pageAt = (path: string) => pages.find(p => p.path === path);
export const redirects = routeSource.compatibility_redirects;
export const EMAIL = 'Healthcare@marketingtusk.com';
export const PHONE = '+91 8920-382016';
export const PHONE_HREF = 'tel:+918920382016';
export const shortTitles: Record<string, string> = {
 audit:'Visibility & Trust Audit', branding:'Branding & Content', website:'Websites & Accessibility',
 local:'Local Presence & Listings', search:'SEO, GEO, AEO & AIO', social:'Social & Visual Content',
 systems:'CRM & Appointments', care:'Website Care & Governance', b2b:'Healthcare B2B Growth'
};
export const serviceIcon: Record<string,string> = {audit:'scan',branding:'pen',website:'browser',local:'pin',search:'search',social:'spark',systems:'grid',care:'shield',b2b:'chart'};
export const sectorIcon: Record<string,string> = {dental:'tooth','dental-chains':'grid',dermatology:'spark','hair-restoration':'leaf',physiotherapy:'activity','therapy-centres':'heart','mental-health':'flower',fertility:'heart','eye-care':'eye',specialist:'cross',multispecialty:'grid',diagnostics:'scan',ayurveda:'leaf',homeopathy:'leaf',hospitals:'hospital',homecare:'home',wellness:'flower',healthtech:'browser','medical-devices':'activity','dental-labs':'tooth','healthcare-education':'book',veterinary:'paw'};
export const resourceInfo: Record<string,{pages:number,tag:string,kicker:string}> = {
 'clinic-website-checklist':{pages:3,tag:'CHECKLIST',kicker:'A clearer first impression'},
 'branch-information-register':{pages:2,tag:'WORKSHEET',kicker:'One source for every location'},
 'healthcare-website-brief':{pages:4,tag:'PLANNING BRIEF',kicker:'A better place to begin'}
};
export function readingTime(p:Page){return Math.max(2,Math.ceil((p.intro+' '+p.sections.map((s:any)=>s.body).join(' ')).split(/\s+/).length/200));}
