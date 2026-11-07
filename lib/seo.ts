import type {Metadata} from 'next';
import {indexingPolicy} from './seo-policy';
import {EMAIL,type Page} from './content';
import {isLaunchArticle,type Editorial} from './editorial';

export const SITE_NAME='Marketing Tusk Healthcare';
export const SEO=indexingPolicy(process.env);
export const canonical=(path:string)=>SEO.origin+path;
const brandId=canonical('/#organization');
const websiteId=canonical('/#website');
const cover=canonical('/og-cover.png');
const logo=canonical('/brand/logos/elephant-healthcare-purple.png');
const SITE_DESCRIPTION='Healthcare website design, branding, search and enquiry systems for clinics, hospitals, diagnostics and healthcare businesses in India.';
export const robotMeta=(eligible:boolean)=>SEO.indexing&&eligible?{index:true,follow:true}:{index:false,follow:SEO.indexing};
const organization={
 '@type':'Organization','@id':brandId,name:SITE_NAME,url:canonical('/'),description:SITE_DESCRIPTION,
 logo:{'@type':'ImageObject',url:logo},parentOrganization:{'@type':'Organization',name:'Marketing Tusk',url:'https://marketingtusk.com/'},
 contactPoint:{'@type':'ContactPoint',email:EMAIL,telephone:'+918920382016',contactType:'business enquiries',areaServed:'IN'},
};
export const pageEligible=(p:Page)=>p.index_policy==='public_after_editorial_approval';
type MetaInput={path:string;title:string;description:string;eligible:boolean;article?:boolean;image?:string};
export function pageMeta(p:MetaInput):Metadata{
 const url=canonical(p.path),image=p.image?canonical(p.image):cover;
 return {
  title:p.title,description:p.description,alternates:{canonical:url},robots:robotMeta(p.eligible),
  openGraph:{type:p.article?'article':'website',siteName:SITE_NAME,locale:'en_IN',title:p.title,description:p.description,url,images:[{url:image,alt:p.image?p.title:SITE_NAME}]},
  twitter:{card:'summary_large_image',title:p.title,description:p.description,images:[image]},
 };
}
export function basePageMeta(p:Page){
 return pageMeta({path:p.path,title:p.seo.title,description:p.seo.description,eligible:pageEligible(p),article:p.type==='blog_post'});
}
export function articleMeta(p:Editorial){
 return pageMeta({path:p.path,title:p.seoTitle.includes('Marketing Tusk')?p.seoTitle:p.seoTitle+' | Marketing Tusk',description:p.seoDescription,eligible:isLaunchArticle(p),article:true,image:p.blocks.find(b=>b.type==='image')?.src});
}
export function graph({path,title,description,type='WebPage',parent,extras=[]}:{path:string;title:string;description:string;type?:string;parent?:{path:string;name:string}[];extras?:Record<string,unknown>[]}){
 const url=canonical(path);
 const crumbs=[{path:'/',name:'Home'},...(parent??[]),{path,name:title}];
 const breadcrumb=path!=='/'?{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:canonical(c.path)}))}:null;
 const page={'@type':type,'@id':url+'#webpage',url,name:title,description,inLanguage:'en-IN',isPartOf:{'@id':websiteId},...(breadcrumb?{breadcrumb:{'@id':breadcrumb['@id']}}:{})};
 const website={'@type':'WebSite','@id':websiteId,url:canonical('/'),name:SITE_NAME,inLanguage:'en-IN',publisher:{'@id':brandId}};
 return {'@context':'https://schema.org','@graph':[organization,website,page,...(breadcrumb?[breadcrumb]:[]),...extras]};
}
export function articleNode(path:string,title:string,description:string,image?:string){
 const url=canonical(path);
 return {'@type':'BlogPosting','@id':url+'#article',url,headline:title,description,
  inLanguage:'en-IN',mainEntityOfPage:{'@id':url+'#webpage'},author:{'@id':brandId},publisher:{'@id':brandId},
  ...(image?{image:canonical(image)}:{}),
 };
}
export function baseGraph(p:Page){
 const isCollection=['service_hub','icp_hub','resource_hub','blog_hub'].includes(p.type);
 const parent=p.type==='service'?[{name:'Services',path:'/services'}]:p.type==='icp'?[{name:'Who We Help',path:'/industries'}]:p.type==='resource'?[{name:'Resources',path:'/resources'}]:p.type==='blog_post'?[{name:'Blog',path:'/blog'}]:[];
 const title=p.hero?.h1||p.h1||p.title||p.seo.title,description=p.seo.description;
 const extras=p.type==='service'?[{'@type':'Service','@id':canonical(p.path)+'#service',name:p.title,serviceType:p.title,description:p.hero.body,url:canonical(p.path),provider:{'@id':brandId},areaServed:{'@type':'Country',name:'India'},mainEntityOfPage:{'@id':canonical(p.path)+'#webpage'}}]:p.type==='blog_post'?[{...articleNode(p.path,p.title,p.summary),datePublished:'2026-10-24',dateModified:p.id.includes('seo-geo-aeo-explained')?'2026-11-06':'2026-10-24'}]:[];
 return graph({path:p.path,title,description,type:isCollection?'CollectionPage':p.type==='contact'?'ContactPage':'WebPage',parent,extras});
}
