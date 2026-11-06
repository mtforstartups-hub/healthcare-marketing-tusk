import data from '../content/pilot-guides.json';
export const pilotGuides=data;
export type PilotGuide=(typeof data)[number];
export const pilotGuideAt=(slug:string)=>pilotGuides.find(x=>x.slug===slug);
export const publishedGuides=pilotGuides.filter(g=>g.status==='published');
export const guidePath=(g:PilotGuide)=>'/guides/'+g.slug;
export const guideCover=(g:PilotGuide)=>'/guide-covers/'+g.id+'.webp';
const publishedPaths=new Map(publishedGuides.map(g=>[guidePath(g),g]));
export const publishedGuideAt=(path:string)=>publishedPaths.get(path);
export const guidesDescription='Practical guides for healthcare teams on website design, branding, local listings, appointments, search and digital operations.';
const topics:Record<string,string>={
 audit:'audit',website:'websites',branding:'brand',local:'listings',systems:'enquiries',
 care:'governance',search:'search',b2b:'b2b',
};
export const guideTopic=(g:PilotGuide)=>g.id==='mt-hc-191'?'b2b':topics[g.service];
export const guideMinutes=(g:PilotGuide)=>Math.max(1,Math.ceil([g.answer,...g.blocks.map(b=>b.text??b.items?.join(' ')??''),...g.faq.map(q=>q.a)].join(' ').split(/\s+/).length/220));
