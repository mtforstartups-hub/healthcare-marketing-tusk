import imported from '../content/editorial.json';
import fieldNotes from '../content/field-notes.json';

export type Block={type:string;text?:string;src?:string;alt?:string;items?:string[]};
export type Editorial={
 slug:string;path:string;title:string;kind:string;category:string;topic?:string;
 summary:string;seoTitle:string;seoDescription:string;answer:string;blocks:Block[];
 related:string[];service:string|null;sector:string|null;worksheet?:string;
 author:string;release:string|number;status:string;publishedAt?:string|null;
};
export const reviewEditorial:Editorial[]=imported;
export const newArticles:Editorial[]=fieldNotes;
export const editorial=[...newArticles,...reviewEditorial];
export const editorialAt=(path:string)=>editorial.find(x=>x.path===path);
export const isLaunchArticle=(p:Editorial)=>p.status==='launch-candidate'&&p.kind==='article';
export const topicIndex=[
 {slug:'websites',title:'Healthcare websites',description:'Plan, build and test clinic and healthcare websites, from mobile contact routes to a safe site migration.'},
 {slug:'listings',title:'Local search and listings',description:'Keep healthcare branch hours, addresses, map pins and public listings accurate when details change.'},
 {slug:'search',title:'Search and AI discovery',description:'Write direct answers, connect related pages and check whether healthcare information can be found and cited.'},
 {slug:'enquiries',title:'Enquiries and appointments',description:'Design enquiry forms and reception workflows that tell visitors what happens next and reach the right team.'},
 {slug:'brand',title:'Brand and content',description:'Write clear healthcare service, consultation and social profile copy using facts the organization can verify.'},
 {slug:'governance',title:'Website governance',description:'Assign ownership for website changes, translations, documents and editorial review.'},
 {slug:'audit',title:'Digital audits',description:'Brief a digital audit, prioritize evidence and decide whether a healthcare website needs repairs or a rebuild.'},
 {slug:'b2b',title:'Healthcare B2B',description:'Build useful product, integration, demo and proof pages for healthcare procurement and practice buyers.'},
];
export const topicAt=(path:string)=>topicIndex.find(t=>path==='/blog/topics/'+t.slug);
export function editorialTime(p:Editorial){return Math.max(1,Math.ceil((p.answer+' '+p.blocks.map(b=>b.text||b.items?.join(' ')||'').join(' ')).split(/\s+/).length/220))}
