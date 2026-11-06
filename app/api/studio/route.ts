import {env} from 'cloudflare:workers';
import {canManageEnquiries} from '../../../lib/admin';
import {json,validOrigin} from '../../../lib/intake';
import {openPayload} from '../../../lib/security';
export async function GET(request:Request){
 if(!await canManageEnquiries())return json({error:'Owner access is required.'},403);
 if(!env.DB||!env.INTAKE_ENCRYPTION_KEY)return json({error:'The enquiry inbox is unavailable.'},503);
 try{const q=new URL(request.url).searchParams;const before=Number(q.get('before'))||Date.now()+1;
 const rows=await env.DB.prepare('SELECT * FROM requests WHERE created_at<? AND expires_at>? ORDER BY created_at DESC LIMIT 51').bind(before,Date.now()).all<any>();const subset=rows.results.slice(0,50);
 const items=await Promise.all(subset.map(async r=>({reference:r.reference,kind:r.kind,status:r.status,created_at:r.created_at,details:await openPayload(r.encrypted_payload,env.INTAKE_ENCRYPTION_KEY!)})));
 const totals=await env.DB.prepare('SELECT kind,count(*) AS total FROM requests WHERE expires_at>? GROUP BY kind').bind(Date.now()).all<{kind:string,total:number}>();
 return json({items,totals:totals.results,next_before:rows.results.length>50?subset[subset.length-1].created_at:null});
 }catch{return json({error:'The inbox could not be loaded. Please try again.'},503)}
}
export async function PATCH(request:Request){
 if(!validOrigin(request)||!await canManageEnquiries())return json({error:'Owner access is required.'},403);if(!env.DB)return json({error:'The inbox is unavailable.'},503);
 try{const body=await request.json() as {reference:string,status:string};if(!/^MTH-[A-F0-9]{12}$/.test(body.reference)||!['new','contacted','qualified','closed','archived'].includes(body.status))return json({error:'Please check the requested change.'},400);await env.DB.prepare('UPDATE requests SET status=? WHERE reference=?').bind(body.status,body.reference).run();return json({saved:true})}catch{return json({error:'The status could not be updated.'},503)}
}
