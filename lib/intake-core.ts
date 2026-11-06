import formConfig from '../content/forms.json';
import options from '../content/form-options.json';
export class ValidationError extends Error{}
export type Kind='audit'|'consultation'|'resource';
const serviceKeys=options.services.map(x=>x.key);const sectorIds=options.sectors.map(x=>x.id);
const resourceIds=['clinic-website-checklist','branch-information-register','healthcare-website-brief'];
function string(value:unknown,label:string,max:number,required=false){if(value!==undefined&&typeof value!=='string')throw new ValidationError('Please check '+label+'.');const s=(value||'').toString().trim();if((required&&!s)||s.length>max)throw new ValidationError('Please check '+label+'.');return s;}
function url(value:unknown,required=false){const s=string(value,'the website or listing address',1000,required);if(!s)return '';try{const u=new URL(s);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error();return u.href;}catch{throw new ValidationError('Use a complete website address starting with https://.')}}
export function validateIntake(raw:any,kind:Kind){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new ValidationError('Please check the form details.');
 if(raw.company_website_confirm)throw new ValidationError('Please submit the form again.');
 const key=string(raw.idempotency_key,'the request identifier',80,true);if(!/^[a-zA-Z0-9_-]{16,80}$/.test(key.replace(/-/g,'_')))throw new ValidationError('Please refresh the page and try again.');
 const name=string(raw.name,'your name',100,true);const email=string(raw.email,'your email',254,true).toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new ValidationError('Please enter a valid email address.');
 const organization=string(raw.organization,'your organization',180,kind!=='resource');
 const source=string(raw.source,'the page',250);if(source&&!/^\/[a-zA-Z0-9_\-/]*$/.test(source))throw new ValidationError('Please refresh the page and try again.');
 if(kind==='resource'){
  const resource_id=string(raw.resource_id,'the resource',100,true);if(!resourceIds.includes(resource_id))throw new ValidationError('Please select an available resource.');
  return {idempotency_key:key,kind,name,email,organization,source,resource_id,marketing_opt_in:raw.marketing_opt_in==='on'||raw.marketing_opt_in===true,consent_version:'resource-2026-10-24'};
 }
 const intent=string(raw.intent,'the enquiry type',30,true);if(!['audit','project','help-me-choose'].includes(intent)||(kind==='audit')!==(intent==='audit'))throw new ValidationError('Please check the enquiry type.');
 const service=intent==='audit'?'audit':string(raw.service,'your service choice',40,intent==='project');if(service&&!serviceKeys.includes(service))throw new ValidationError('Please choose a listed service.');if(intent!=='audit'&&service==='audit')throw new ValidationError('Please select the free audit enquiry type.');
 const icp=string(raw.icp,'your organization type',80,true);if(icp!=='other'&&!sectorIds.includes(icp))throw new ValidationError('Please select your organization type.');
 const city=string(raw.city,'your city or region',100,intent==='audit');
 const contact_preference=string(raw.contact_preference,'your contact preference',10,true);if(!['email','phone'].includes(contact_preference))throw new ValidationError('Please select email or phone contact.');
 const phone=contact_preference==='phone'?string(raw.phone,'your phone number',32,true):'';if(phone&&!/^\+?[\d\s().-]{7,32}$/.test(phone))throw new ValidationError('Please enter a valid business phone number.');
 if(!(raw.consent===true||raw.consent==='on'))throw new ValidationError('Please agree to be contacted about your enquiry.');
 const notes=string(raw.notes,'your project description',1500);if(raw.answers!==undefined&&(!raw.answers||typeof raw.answers!=='object'||Array.isArray(raw.answers)))throw new ValidationError('Please check the additional answers.');
 const input=raw.answers||{};const questions=(formConfig.conditional as any)[service]||[];const answers:Record<string,string|string[]>={};
 for(const q of questions){
  if(q.key==='website'&&service==='audit'&&input.website_status!=='Yes')continue;
  if(q.key==='website'&&service==='website'&&(!input.website_need||input.website_need==='New website'))continue;
  const required=!!q.required||(service==='audit'&&q.key==='website');
  const value=input[q.key];
  if(q.type==='multi_select'&&Array.isArray(value)){if(value.some((v:any)=>typeof v!=='string'||!q.options.includes(v)))throw new ValidationError('Please check '+q.label+'.');answers[q.key]=[...new Set(value)] as string[];continue}
  const s=q.key==='website'||q.key.includes('url')?url(value,required):string(value,q.label,q.max_length||500,required);
  if(s&&q.options&&!q.options.includes(s))throw new ValidationError('Please check '+q.label+'.');if(s)answers[q.key]=s;
 }
 const lane=options.sectors.find(x=>x.id===icp)?.lane||'Other';
 return {idempotency_key:key,kind,intent,name,email,organization,source,service,icp,lane,city,contact_preference,phone,notes,answers,consent:true,consent_version:'enquiry-2026-10-24',needs_manual_scope:service==='b2b'&&lane!=='B2B'};
}
export function visibleAnswersFor(service:string,answers:Record<string,unknown>){const result={...answers};if(service==='audit'&&result.website_status!=='Yes')delete result.website;if(service==='website'&&result.website_need==='New website')delete result.website;return result}
