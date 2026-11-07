import {SEO} from '../../lib/seo';
import {robotsRules} from '../../lib/seo-policy';
export const dynamic='force-dynamic';
export function GET(){
 return new Response(robotsRules(SEO.indexing,SEO.origin),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
}
