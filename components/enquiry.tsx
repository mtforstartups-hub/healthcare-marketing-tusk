'use client';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {Icon} from './icons';
import config from '../content/forms.json';
import options from '../content/form-options.json';

export type Intent = 'project'|'audit'|'help-me-choose';
export type EnquiryContext = {intent?:Intent,service?:string,icp?:string,source?:string,title?:string};
const EnquiryContext = createContext<(v:EnquiryContext)=>void>(()=>{});
function requestId(){const bytes=crypto.getRandomValues(new Uint8Array(16));return Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('')}

export function EnquiryProvider({children}:{children:React.ReactNode}){
 const [context,setContext]=useState<EnquiryContext|null>(null);const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(context){dialog.current?.showModal();document.body.style.overflow='hidden'}else{dialog.current?.close();document.body.style.overflow=''}return()=>{document.body.style.overflow=''}},[context]);
 return <EnquiryContext.Provider value={setContext}>{children}<dialog ref={dialog} aria-label="Contact Marketing Tusk Healthcare" className="enquiry-dialog" onCancel={()=>setContext(null)} onClick={e=>{if(e.target===dialog.current)setContext(null)}}><div className="dialog-inner"><button className="icon-button dialog-close" aria-label="Close enquiry form" onClick={()=>setContext(null)}><Icon name="close"/></button>{context&&<EnquiryForm key={JSON.stringify(context)} initial={context} modal/>}</div></dialog></EnquiryContext.Provider>
}
export function EnquiryButton({children,className='button primary',context={},icon=true}:{children:React.ReactNode,className?:string,context?:EnquiryContext,icon?:boolean}){
 const open=useContext(EnquiryContext);return <button type="button" className={className} onClick={()=>open({...context,source:context.source||window.location.pathname})}>{children}{icon&&<Icon name="arrow" size={18}/>}</button>
}

export function EnquiryForm({initial={},modal=false,showIntent=true}:{initial?:EnquiryContext,modal?:boolean,showIntent?:boolean}){
 const [intent,setIntent]=useState<Intent>(initial.intent||'project'); const [service,setService]=useState(initial.service||(initial.intent==='audit'?'audit':''));
 const [icp,setIcp]=useState(initial.icp||'');const [preference,setPreference]=useState('email');const [answers,setAnswers]=useState<Record<string,string|string[]>>({});
 const [state,setState]=useState('idle');const [error,setError]=useState('');const [reference,setReference]=useState('');const [idKey]=useState(requestId);
 const form=useRef<HTMLFormElement>(null);const activeService=intent==='audit'?'audit':service;
 const questionList=((config.conditional as any)[activeService]||[]) as any[];
 function changeIntent(v:Intent){setIntent(v);setAnswers({});if(v==='audit')setService('audit');else if(service==='audit')setService('');setState('idle');setError('')}
 function changeService(v:string){setService(v);setAnswers({});setError('')}
 const heading=intent==='audit'?'See what needs attention.':intent==='help-me-choose'?'Let’s find the right starting point.':initial.title&&service===initial.service?initial.title:options.services.find(x=>x.key===service)?.cta||'Tell us what you have in mind.';
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setError('');if(!form.current?.reportValidity())return;setState('submitting');
  const fd=new FormData(form.current);const payload={...Object.fromEntries(fd),intent,service:activeService,icp,contact_preference:preference,answers,source:initial.source||window.location.pathname,idempotency_key:idKey};
  try{const res=await fetch(intent==='audit'?'/api/audit-requests':'/api/consultation-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json() as {error?:string,reference:string};if(!res.ok)throw new Error(data.error||'We could not save your enquiry. Please try again.');setReference(data.reference);setState('accepted')}catch(err){setState('error');setError(err instanceof Error?err.message:'Please try again. Your enquiry has not been saved.')}
 }
 if(state==='accepted')return <div className="form-success" role="status"><div className="success-icon"><Icon name="check" size={30}/></div><span className="eyebrow">ENQUIRY RECEIVED</span><h2>Thank you.<br/>Let’s take it from here.</h2><p>Our team will review your details and respond using your chosen contact channel.</p><p className="reference">Your reference: {reference}</p><p className="small">A meeting is confirmed only after we agree a time with you.</p><a className="text-link" href="/services">Explore our services <Icon name="arrow" size={17}/></a></div>;
 return <section className={modal?'form-content':'form-content inline-form'} id={modal?undefined:'enquiry'}>
  <span className="eyebrow">{intent==='audit'?'YOUR FREE AUDIT':'LET’S CONNECT'}</span><h2>{heading}</h2><p className="form-intro">{intent==='audit'?'Share your organization details for a focused review of your digital presence.':'A few details will help us understand your priorities.'}</p>
  {showIntent&&<div className="intent-tabs" role="group" aria-label="Enquiry type">{[{value:'project',label:'Discuss a project'},{value:'audit',label:'Free audit'},{value:'help-me-choose',label:'Help me choose'}].map(v=><button type="button" key={v.value} className={intent===v.value?'selected':''} aria-pressed={intent===v.value} onClick={()=>changeIntent(v.value as Intent)}>{v.label}</button>)}</div>}
  <form ref={form} onSubmit={submit}>
   <div className="form-grid">
    <label>Your name <span>*</span><input name="name" autoComplete="name" required maxLength={100}/></label>
    <label>Organization <span>*</span><input name="organization" autoComplete="organization" required maxLength={180}/></label>
    <label>Business email <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>Organization type <span>*</span><select name="icp" value={icp} onChange={e=>setIcp(e.target.value)} required><option value="">Select your organization</option>{options.sectors.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}<option value="other">Other healthcare organization</option></select></label>
    {intent!=='audit'&&<label className="span-two">What would you like help with?{intent==='project'&&<span> *</span>}<select value={service} onChange={e=>changeService(e.target.value)} required={intent==='project'}><option value="">{intent==='help-me-choose'?'I’m not sure yet':'Choose a service'}</option>{options.services.filter(s=>s.key!=='audit').map(s=><option value={s.key} key={s.key}>{s.title}</option>)}</select></label>}
    <label>City or region{intent==='audit'&&<span> *</span>}<input name="city" autoComplete="address-level2" required={intent==='audit'} maxLength={100}/></label>
    <label>How should we contact you?<select value={preference} onChange={e=>setPreference(e.target.value)}><option value="email">Email</option><option value="phone">Phone</option></select></label>
    {preference==='phone'&&<label className="span-two">Business phone <span>*</span><input name="phone" type="tel" autoComplete="tel" required maxLength={32} placeholder="Include your country code"/></label>}
    {questionList.map(q=>{
     if(q.key==='website'&&activeService==='audit'&&answers.website_status!=='Yes')return null;
     if(q.key==='website'&&activeService==='website'&&(!answers.website_need||answers.website_need==='New website'))return null;
     const required=!!q.required||(q.key==='website'&&activeService==='audit');
     if(q.type==='multi_select')return <fieldset className="span-two channel-choices" key={q.key}><legend>{q.label}</legend>{q.options.map((v:string)=><label key={v}><input type="checkbox" value={v} checked={Array.isArray(answers[q.key])&&answers[q.key].includes(v)} onChange={e=>setAnswers(a=>{const list=Array.isArray(a[q.key])?a[q.key] as string[]:[];return {...a,[q.key]:e.target.checked?[...list,v]:list.filter(s=>s!==v)}})}/>{v}</label>)}</fieldset>;
     return <label key={activeService+q.key}>{q.label}{required&&<span> *</span>}{q.options?<select name={q.key} value={answers[q.key]||''} required={required} onChange={e=>setAnswers(a=>{const b:Record<string,string|string[]>={...a,[q.key]:e.target.value};if(q.key==='website_status'||q.key==='website_need')delete b.website;return b})}><option value="">Select an option</option>{q.options.map((v:string)=><option key={v}>{v}</option>)}</select>:<input name={q.key} type={q.key.includes('url')||q.key==='website'?'url':'text'} placeholder={q.key==='website'||q.key.includes('url')?'https://':''} value={answers[q.key]||''} required={required} maxLength={q.max_length||500} onChange={e=>setAnswers(a=>({...a,[q.key]:e.target.value}))}/>}</label>;
    })}
    <label className="span-two">Anything else we should know? <small>Optional</small><textarea name="notes" rows={3} maxLength={1500} placeholder="A short description of your project or priority"/></label>
   </div>
   <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="company_website_confirm" tabIndex={-1} autoComplete="off"/></label></div>
   <label className="checkbox-row"><input type="checkbox" name="consent" required/><span>I agree to be contacted about this enquiry and have read the <a href="/privacy" target={modal?'_blank':undefined}>Privacy Notice</a>.</span></label>
   <p className="field-hint">Please share business information only. Do not include patient details or medical records.</p>
   {error&&<p className="form-error" role="alert">{error}</p>}
   <button className="button primary form-submit" disabled={state==='submitting'} type="submit">{state==='submitting'?'Saving your enquiry…':intent==='audit'?'Request Free Audit':intent==='help-me-choose'?'Ask for Guidance':'Send Project Enquiry'}<Icon name="arrow" size={18}/></button>
  </form>
 </section>
}

export function ResourceForm({id}:{id:string}){
 const [state,setState]=useState('idle');const [error,setError]=useState('');const [download,setDownload]=useState('');const [key,setKey]=useState(requestId);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;setState('submitting');setError('');
  try{const res=await fetch('/api/resource-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(new FormData(f)),resource_id:id,idempotency_key:key,source:window.location.pathname})});const d=await res.json() as {error?:string,download_url:string};if(!res.ok)throw new Error(d.error||'We could not prepare your download. Please try again.');setDownload(d.download_url);setState('accepted')}catch(e){setState('error');setError(e instanceof Error?e.message:'Please try again.')}
 }
 if(state==='accepted')return <div className="download-success" role="status"><div className="success-icon"><Icon name="check"/></div><h3>Your resource is ready.</h3><p>Download your copy below. This link is available for 30 minutes.</p><a className="button primary" href={download}>Download PDF <Icon name="download" size={18}/></a><button className="text-link" onClick={()=>{setState('idle');setDownload('');setKey(requestId())}}>Request another download</button></div>;
 return <form className="resource-form" onSubmit={submit}><span className="eyebrow">A USEFUL STARTING POINT</span><h2>Get the free resource.</h2><p>Enter your business email to access the file.</p><label>Your name <span>*</span><input name="name" required autoComplete="name" maxLength={100}/></label><label>Business email <span>*</span><input name="email" required type="email" autoComplete="email" maxLength={254}/></label><label>Organization <small>Optional</small><input name="organization" autoComplete="organization" maxLength={180}/></label><div className="honeypot" aria-hidden="true"><input name="company_website_confirm" tabIndex={-1} autoComplete="off"/></div><label className="checkbox-row"><input type="checkbox" name="marketing_opt_in"/><span>Send me occasional healthcare digital-presence updates.</span></label><p className="field-hint">Your details provide access to this resource. Marketing updates are optional. Read our <a href="/privacy">Privacy Notice</a>.</p>{error&&<p role="alert" className="form-error">{error}</p>}<button className="button primary form-submit" disabled={state==='submitting'}>{state==='submitting'?'Preparing your download…':'Get the Download'}<Icon name="download" size={18}/></button></form>;
}
