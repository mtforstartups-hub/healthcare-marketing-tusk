import {env} from 'cloudflare:workers';
import {sign,sameSignature,base64ToBytes} from '../../../lib/security';
import registry from '../../../content/resource-files.json';
export async function GET(request:Request){
 const q=new URL(request.url).searchParams;const reference=q.get('reference')||'';const resource=q.get('resource')||'';const expires=Number(q.get('expires')||0);const signature=q.get('signature')||'';
 const reject=(message:string,status:number)=>new Response(message,{status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
 if(!env.INTAKE_ENCRYPTION_KEY||!env.DB||!env.BUCKET)return reject('Downloads are temporarily unavailable. Please try again later.',503);
 if(!(resource in registry)||!/^MTH-[A-F0-9]{12}$/.test(reference)||!Number.isFinite(expires)||expires<Date.now()||expires>Date.now()+31*60000||!/^[a-f0-9]{64}$/.test(signature))return reject('This download link is invalid or has expired. Request a fresh link from the resource page.',403);
 if(!sameSignature(signature,await sign(reference+'.'+resource+'.'+expires,env.INTAKE_ENCRYPTION_KEY)))return reject('This download link is invalid. Please request a fresh link.',403);
 const row=await env.DB.prepare('SELECT reference FROM requests WHERE reference=? AND resource_id=? AND kind=? AND expires_at>?').bind(reference,resource,'resource',Date.now()).first();if(!row)return reject('This download is no longer available. Please request a fresh link.',403);
 const file=(registry as any)[resource];const key='resources/v1/'+resource+'.pdf';
 let object=await env.BUCKET.get(key);if(!object){await env.BUCKET.put(key,base64ToBytes(file.data),{httpMetadata:{contentType:'application/pdf'}});object=await env.BUCKET.get(key)}
 if(!object)return reject('The file is temporarily unavailable. Please try again.',503);
 return new Response(object.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+file.filename+'"','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}})
}
