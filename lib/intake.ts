import {env} from 'cloudflare:workers';
import {validateIntake,ValidationError,type Kind} from './intake-core';
import {sealPayload,hash,sign} from './security';
import registry from '../content/resource-files.json';
const JSON_HEADERS={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export function json(value:unknown,status=200){return new Response(JSON.stringify(value),{status,headers:JSON_HEADERS})}
export function validOrigin(request:Request){const origin=request.headers.get('origin');return !!origin&&origin===new URL(request.url).origin&&request.headers.get('sec-fetch-site')!=='cross-site'}
async function boundedBody(request:Request){if(!request.headers.get('content-type')?.startsWith('application/json'))throw new ValidationError('Please use the website form.');if(Number(request.headers.get('content-length')||0)>20000)throw new ValidationError('Please shorten your enquiry.');const reader=request.body?.getReader();if(!reader)throw new ValidationError('Please check the form.');const chunks:Uint8Array[]=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>20000){await reader.cancel();throw new ValidationError('Please shorten your enquiry.')}chunks.push(value)}const bytes=new Uint8Array(size);let i=0;for(const c of chunks){bytes.set(c,i);i+=c.length}try{return JSON.parse(new TextDecoder().decode(bytes))}catch{throw new ValidationError('Please check the form and try again.')}}
async function resourceResponse(ref:string,id:string){const expires=Date.now()+30*60*1000;const signature=await sign(ref+'.'+id+'.'+expires,env.INTAKE_ENCRYPTION_KEY!);return {reference:ref,download_url:'/api/download?reference='+encodeURIComponent(ref)+'&resource='+encodeURIComponent(id)+'&expires='+expires+'&signature='+signature}}
export async function intake(request:Request,kind:Kind){
 if(!validOrigin(request))return json({error:'Please submit this request from the website.'},403);
 if(!env.DB||!env.INTAKE_ENCRYPTION_KEY||!/^[0-9a-f]{64}$/.test(env.INTAKE_ENCRYPTION_KEY))return json({error:'The enquiry service is temporarily unavailable. Please email Healthcare@marketingtusk.com.'},503);
 try{
  const details=validateIntake(await boundedBody(request),kind);const now=Date.now();
  if(kind==='resource'&&(!(details.resource_id! in registry)||!env.BUCKET))return json({error:'This resource is temporarily unavailable. Please try again later.'},503);
  const fingerprint=await hash(JSON.stringify(details));
  const existing=await env.DB.prepare('SELECT reference,fingerprint,expires_at FROM requests WHERE idempotency_key=?').bind(details.idempotency_key).first<{reference:string,fingerprint:string,expires_at:number}>();
  if(existing){if(existing.fingerprint!==fingerprint)return json({error:'This request changed after a previous submission. Please refresh the page and submit again.'},409);return json(kind==='resource'?await resourceResponse(existing.reference,details.resource_id!):{reference:existing.reference,accepted:true,duplicate:true})}
  const ip=request.headers.get('cf-connecting-ip')||'local';const limitKey=await sign(ip+':'+Math.floor(now/600000),env.INTAKE_ENCRYPTION_KEY);
  const count=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(limitKey,now+600000).first<{count:number}>();
  if((count?.count||0)>20)return json({error:'There have been several requests recently. Please wait a few minutes or contact us directly.'},429);
  const reference='MTH-'+crypto.randomUUID().replace(/-/g,'').slice(0,12).toUpperCase();const payload=await sealPayload({...details,received_at:new Date(now).toISOString()},env.INTAKE_ENCRYPTION_KEY);
  const statements=[env.DB.prepare('INSERT INTO requests (reference,kind,status,idempotency_key,fingerprint,encrypted_payload,resource_id,service,icp,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(reference,kind,'new',details.idempotency_key,fingerprint,payload,details.resource_id||null,details.service||null,details.icp||null,now,now+90*86400000)];
  if(env.CRM_WEBHOOK_URL&&env.CRM_WEBHOOK_SECRET)statements.push(env.DB.prepare('INSERT INTO deliveries (id,reference,status,attempts,created_at,next_at) VALUES (?,?,?,0,?,?)').bind(crypto.randomUUID(),reference,'pending',now,now));
  try{await env.DB.batch(statements)}catch{
   const duplicate=await env.DB.prepare('SELECT reference,fingerprint FROM requests WHERE idempotency_key=?').bind(details.idempotency_key).first<{reference:string,fingerprint:string}>();
   if(duplicate?.fingerprint===fingerprint)return json(kind==='resource'?await resourceResponse(duplicate.reference,details.resource_id!):{reference:duplicate.reference,accepted:true,duplicate:true});throw Error('Storage unavailable');
  }
  await env.DB.batch([env.DB.prepare('DELETE FROM deliveries WHERE reference IN (SELECT reference FROM requests WHERE expires_at < ?)').bind(now),env.DB.prepare('DELETE FROM requests WHERE expires_at < ?').bind(now),env.DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now)]);
  return json(kind==='resource'?await resourceResponse(reference,details.resource_id!):{reference,accepted:true},201);
 }catch(e){if(e instanceof ValidationError)return json({error:e.message},400);return json({error:'We could not save your enquiry. Please try again or email Healthcare@marketingtusk.com.'},503)}
}
