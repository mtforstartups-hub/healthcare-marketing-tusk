import {notFound} from 'next/navigation';
import {canManageEnquiries} from '../../../../lib/admin';
import {guideCover,guidePath,pilotGuideAt} from '../../../../lib/pilot';
import {services,sectors} from '../../../../lib/content';

export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){
 const p=await canManageEnquiries()?pilotGuideAt((await params).slug):null;
 return {title:(p?.seoTitle??'Editorial Review')+' | Marketing Tusk Healthcare',description:p?.description,robots:{index:false,follow:false}};
}

function Copy({text}:{text:string}){
 return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part,i)=>part.startsWith('**')&&part.endsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part.startsWith('`')&&part.endsWith('`')?<code key={i}>{part.slice(1,-1)}</code>:part)}</>;
}
export default async function PilotGuidePage({params}:Props){
 if(!await canManageEnquiries())notFound();
 const p=pilotGuideAt((await params).slug);if(!p)notFound();
 const service=services.find(s=>s.service_key===p.service),sector=sectors.find(s=>s.id===p.sector);
 const audit='/contact?intent=audit'+(p.sector?'&icp='+p.sector:'');
 return <main id="main" className="pilot-studio"><article>
 <header className="article-header"><div className="container">
 <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/studio">Owner workspace</a><a href="/studio/editorial">Editorial register</a><span aria-current="page">{p.topicId}</span></nav>
 <div className="article-title"><span className="review-label">Published guide · Owner notes</span><h1>{p.title}</h1><p>{p.category} · Editorial week {p.week} · {p.topicId}</p></div>
 </div></header>
 <div className="container article-layout"><aside className="article-toc"><span className="eyebrow">On this page</span>{p.blocks.map((b,i)=>b.type==='heading'&&<a key={i} href={'#section-'+i}>{b.text}</a>)}<a href="#questions">Questions and answers</a><a href="#sources">Source register</a><a href="#release">Editorial notes</a></aside>
 <div className="article-body editorial-body">
 <div className="answer-box"><span className="eyebrow">The short answer</span><p>{p.answer}</p></div>
 <figure><img src={guideCover(p)} alt={p.cover.alt} width={p.cover.width} height={p.cover.height} loading="lazy" decoding="async"/></figure>
 {p.blocks.map((b,i)=>b.type==='heading'?<h2 key={i} id={'section-'+i}>{b.text}</h2>:b.type==='bullets'?<ul key={i}>{b.items?.map((item,j)=><li key={j}><Copy text={item}/></li>)}</ul>:<p key={i}><Copy text={b.text??''}/></p>)}
 <section id="questions"><h2>Questions and answers</h2>{p.faq.map(q=><div key={q.q}><h3>{q.q}</h3><p>{q.a}</p></div>)}</section>
 <section id="sources"><h2>Source register</h2><p>This record retains the source review notes from the original editorial package.</p><ul>{p.references.map(r=><li key={r.title}>{r.url?<a href={r.url}>{r.title}</a>:r.title}{r.kind==='withheld'?' (withheld from factual use)':r.kind==='context'?' (industry context)':''}</li>)}</ul></section>
 <section id="release" className="pilot-release"><h2>Editorial notes</h2>
 <dl><dt>Review note from source tracker</dt><dd>{p.regulatoryReview}</dd><dt>Provisional date in tracker</dt><dd><time dateTime={p.provisionalDate}>{p.provisionalDate}</time> · Original planning date</dd><dt>Search query to validate</dt><dd>{p.keyword}</dd><dt>India search volume and difficulty</dt><dd>Pending validation</dd><dt>Search title</dt><dd>{p.seoTitle}</dd><dt>Search description</dt><dd>{p.description}</dd></dl>
 {p.comparison&&<p><a href={p.comparison}>Compare with existing site content</a> for overlap and internal linking.</p>}
 <p><a href={guidePath(p)}>Open published guide</a></p>
 <p>Related site pages: {service&&<><a href={service.path}>{service.title}</a> · </>}{sector&&<><a href={sector.path}>{sector.title}</a> · </>}<a href={audit}>Request an audit</a>.</p>
 </section></div></div></article></main>;
}
