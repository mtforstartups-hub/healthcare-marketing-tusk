import {canManageEnquiries} from '../../../../../lib/admin';
import {guideCover,publishedGuides} from '../../../../../lib/pilot';

export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'};
 if(!await canManageEnquiries())return new Response(null,{status:404,headers});
 const {id}=await params;
 const guide=publishedGuides.find(g=>g.id===id);
 return guide?new Response(null,{status:307,headers:{...headers,Location:guideCover(guide)}}):new Response(null,{status:404,headers});
}
