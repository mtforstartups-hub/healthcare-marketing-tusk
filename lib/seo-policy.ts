export const REVIEW_ORIGIN='https://healthcare.marketingtusk.chatgpt.site';
export function indexingPolicy(vars:{SEO_INDEXING?:string;SEO_PUBLIC_ORIGIN?:string;SITE_ACCESS_MODE?:string}){
 // Public indexing requires a separate, deliberate launch configuration.
 if(vars.SEO_INDEXING==='public'&&vars.SITE_ACCESS_MODE==='public'&&vars.SEO_PUBLIC_ORIGIN){
  try {
   const url=new URL(vars.SEO_PUBLIC_ORIGIN);
   if(url.protocol==='https:'&&url.hostname==='healthcare.marketingtusk.com'&&!url.port&&!url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash)return {indexing:true,origin:url.origin};
  }catch{}
 }
 return {indexing:false,origin:REVIEW_ORIGIN};
}
export function robotsRules(indexing:boolean,origin:string){
 if(!indexing)return 'User-agent: *\nDisallow: /\n';
 return 'User-agent: *\nDisallow: /api/\nDisallow: /studio\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: '+origin+'/sitemap.xml\n';
}
