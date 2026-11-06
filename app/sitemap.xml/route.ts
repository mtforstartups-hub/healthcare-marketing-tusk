import {pages} from '../../lib/content';
import {canonical,SEO,pageEligible} from '../../lib/seo';
import {newArticles,topicIndex} from '../../lib/editorial';
import {guidePath,publishedGuides} from '../../lib/pilot';
import worksheets from '../../content/tools.json';

export function GET(){
 const paths=SEO.indexing?[...pages.filter(pageEligible).map(p=>p.path),...worksheets.map(w=>'/resources/'+w.slug),...newArticles.map(p=>p.path),...topicIndex.map(t=>'/blog/topics/'+t.slug),'/guides',...publishedGuides.map(guidePath)]:[];
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>'<url><loc>'+canonical(path)+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store'}});
}
