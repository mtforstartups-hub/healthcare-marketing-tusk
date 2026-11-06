import {canManageEnquiries} from '../../../../../lib/admin';
import diagrams from '../../../../../content/review-diagrams.json';

export const dynamic='force-dynamic';

export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){
 const headers={
  'Cache-Control':'private, no-store',
  'X-Robots-Tag':'noindex',
  'X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox",
 };
 if(!await canManageEnquiries())return new Response(null,{status:404,headers});
 const {name}=await params;
 if(!Object.hasOwn(diagrams,name))return new Response(null,{status:404,headers});
 return new Response(diagrams[name as keyof typeof diagrams],{headers:{...headers,'Content-Type':'image/svg+xml; charset=utf-8'}});
}
