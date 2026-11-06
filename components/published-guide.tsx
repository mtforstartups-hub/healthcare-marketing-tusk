import {services,sectors} from '../lib/content';
import {guideCover,guideMinutes,guidePath,guideTopic,publishedGuides,type PilotGuide} from '../lib/pilot';
import {articleNode,graph} from '../lib/seo';
import {Breadcrumb} from './pages';
import {Inline} from './editorial';
import {EnquiryButton} from './enquiry';
import {JsonLd} from './seo';

export function PublishedGuide({guide:g}:{guide:PilotGuide}){
 const path=guidePath(g),cover=guideCover(g);
 const sector=sectors.find(p=>p.id===g.sector),service=services.find(p=>p.service_key===g.service);
 const related=publishedGuides.filter(p=>p.id!==g.id&&(guideTopic(p)===guideTopic(g)||!!g.sector&&p.sector===g.sector)).slice(0,3);
 const sources=g.references.filter(r=>r.url&&r.kind!=='withheld');
 const headings=g.blocks.flatMap((b,i)=>b.type==='heading'?[{id:'section-'+i,title:b.text}]:[]);
 const schema=graph({path,title:g.title,description:g.description,parent:[{path:'/guides',name:'Healthcare guides'}],extras:[articleNode(path,g.title,g.description,cover)]});
 return <main id="main"><JsonLd value={schema}/><article>
 <header className="article-header"><div className="container">
 <Breadcrumb items={[{label:'Guides',href:'/guides'},{label:g.category}]}/>
 <div className="article-title"><span className="eyebrow">Guide · {g.category}</span><h1>{g.title}</h1>
 <div className="editorial-byline"><a href="/#about">Marketing Tusk Healthcare</a><span>{guideMinutes(g)} min read</span></div>
 </div></div></header>
 <div className="container article-layout"><aside className="article-toc"><span className="eyebrow">On this page</span>
 {headings.map(h=><a key={h.id} href={'#'+h.id}>{h.title}</a>)}
 {g.faq.length>0&&<a href="#questions">Questions and answers</a>}{sources.length>0&&<a href="#sources">Sources</a>}</aside>
 <div className="article-body editorial-body"><div className="answer-box"><span className="eyebrow">The short answer</span><p><Inline value={g.answer}/></p></div>
 <figure><img src={cover} alt={g.cover.alt} width={g.cover.width} height={g.cover.height} loading="lazy" decoding="async"/></figure>
 {g.blocks.map((b,i)=>b.type==='heading'?<h2 key={i} id={'section-'+i}>{b.text}</h2>:b.type==='bullets'?<ul key={i}>{b.items?.map((item,j)=><li key={j}><Inline value={item}/></li>)}</ul>:<p key={i}><Inline value={b.text??''}/></p>)}
 {g.faq.length>0&&<section id="questions"><h2>Questions and answers</h2>{g.faq.map(q=><div key={q.q}><h3>{q.q}</h3><p>{q.a}</p></div>)}</section>}
 {sources.length>0&&<section id="sources" className="article-sources"><h2>Sources and further reading</h2><ul>{sources.map(r=><li key={r.title}><a href={r.url!}>{r.title}</a>{r.kind==='context'?' (industry context)':''}</li>)}</ul></section>}
 {related.length>0&&<section className="reading-related"><h2>Related guides</h2><ul>{related.map(p=><li key={p.id}><a href={guidePath(p)}>{p.title}</a></li>)}</ul></section>}
 <div className="article-end-cta"><h2>Review your digital presence</h2><p>Get practical recommendations for your website, listings and enquiry experience.</p>
 <EnquiryButton context={{intent:'audit',icp:g.sector??undefined,source:path}}>Request a free audit</EnquiryButton>
 {(service||sector)&&<p>{service&&<a href={service.path}>{service.title}</a>}{service&&sector&&' · '}{sector&&<a href={sector.path}>{sector.title}</a>}</p>}</div>
 </div></div></article></main>;
}
