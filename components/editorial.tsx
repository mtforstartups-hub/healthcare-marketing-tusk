import {editorial,editorialTime,isLaunchArticle,newArticles,reviewEditorial,topicIndex,type Editorial} from '../lib/editorial';
import {services,sectors,posts,readingTime} from '../lib/content';
import {Breadcrumb} from './pages';
import {ReadingCard,EditorialDirectory,PrintTool,type Listing} from './editorial-directory';
import {EnquiryButton} from './enquiry';
import tools from '../content/tools.json';
import {articleNode,canonical,graph} from '../lib/seo';
import {JsonLd} from './seo';
import {guideMinutes,guidePath,guideTopic,guidesDescription,publishedGuides,type PilotGuide} from '../lib/pilot';

export {tools as worksheets};
export const worksheetAt=(path:string)=>tools.find(t=>path==='/resources/'+t.slug);
export const entryItem=(p:Editorial):Listing=>({title:p.title,path:p.path,summary:p.summary,category:p.category,kind:p.kind==='guide'?'Guide':p.kind==='answer'?'Answer':'Article',minutes:editorialTime(p)});
const guideItem=(g:PilotGuide):Listing=>({title:g.title,path:guidePath(g),summary:g.description,category:g.category,kind:'Guide',minutes:guideMinutes(g)});
const blogItems=posts.map(p=>({title:p.title,path:p.path,summary:p.summary,category:p.category,kind:'Article',minutes:readingTime(p)}));
export function ReadingHub({allowReview,initial='All'}:{allowReview:boolean;initial?:string}){
 const title=initial==='Guide'?'Healthcare guides':initial==='Answer'?'Healthcare answers':'Healthcare articles, guides and answers';
 const path=initial==='Guide'?'/guides':initial==='Answer'?'/answers':'/blog';
 const description=guidesDescription;
 const approved=publishedGuides.map(guideItem);
 const items=initial==='Guide'?approved:initial==='Answer'?reviewEditorial.filter(e=>e.kind==='answer').map(entryItem):[...approved,...newArticles.map(entryItem),...blogItems,...(allowReview?reviewEditorial.map(entryItem):[])];
 const extras=initial==='Guide'?[{'@type':'ItemList',itemListElement:approved.map((e,i)=>({'@type':'ListItem',position:i+1,url:canonical(e.path),name:e.title}))}]:[];
 return <main id="main"><JsonLd value={graph({path,title,description,type:'CollectionPage',parent:path==='/answers'?[{path:'/blog',name:'Blog'}]:[],extras})}/><section className="page-hero"><div className="container"><Breadcrumb items={path==='/blog'?[{label:'Blog'}]:initial==='Guide'?[{label:'Guides'}]:[{label:'Blog',href:'/blog'},{label:'Answers'}]}/><h1>{title}</h1><p>{description}</p>{initial==='Answer'&&<span className="review-label">Editorial preview</span>}</div></section>{initial!=='Answer'&&<section className="container reading-topics" aria-labelledby="topics-heading"><h2 id="topics-heading">Browse by topic</h2><ul>{initial==='All'&&<li><a href="/guides">All 24 guides</a></li>}{topicIndex.map(t=><li key={t.slug}><a href={'/blog/topics/'+t.slug}>{t.title}</a></li>)}</ul>{allowReview&&<p className="review-links"><a href="/studio/editorial">Editorial register</a><a href="/answers">Review answers</a></p>}</section>}<section className="section reading-section"><div className="container"><EditorialDirectory items={items} initial={initial} pageSize={initial==='Guide'?24:18}/></div></section></main>;
}
export function TopicPage({p}:{p:typeof topicIndex[number]}){
 const entries=[...publishedGuides.filter(g=>guideTopic(g)===p.slug).map(guideItem),...newArticles.filter(x=>x.topic===p.slug).map(entryItem)];
 const path='/blog/topics/'+p.slug;
 const extras=[{'@type':'ItemList',itemListElement:entries.map((e,i)=>({'@type':'ListItem',position:i+1,url:canonical(e.path),name:e.title}))}];
 return <main id="main"><JsonLd value={graph({path,title:p.title,description:p.description,type:'CollectionPage',parent:[{path:'/blog',name:'Blog'}],extras})}/><section className="page-hero"><div className="container"><Breadcrumb items={[{label:'Blog',href:'/blog'},{label:p.title}]}/><h1>{p.title}</h1><p>{p.description}</p></div></section><section className="section reading-section"><div className="container"><div className="reading-grid">{entries.map(x=><ReadingCard key={x.path} item={x}/>)}</div><div className="worksheet-next"><a href="/blog">All healthcare articles</a><a href="/resources">Worksheets and downloads</a></div></div></section></main>;
}
export function Inline({value}:{value:string}){return <>{value.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g).map((part,i)=>{
 const m=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
 if(m&&(/^https:\/\//.test(m[2])||(/^\//.test(m[2])&&!/^\/\//.test(m[2]))))return <a href={m[2]} key={i}>{m[1]}</a>;
 if(part.startsWith('**')&&part.endsWith('**'))return <strong key={i}>{part.slice(2,-2)}</strong>;
 if(part.startsWith('`')&&part.endsWith('`'))return <code key={i}>{part.slice(1,-1)}</code>;
 return part;
 })}</>}
export function EditorialPage({p,allowReview}:{p:Editorial;allowReview:boolean}){
 const launch=isLaunchArticle(p),topic=topicIndex.find(t=>t.slug===p.topic);
 const worksheet=tools.find(t=>t.slug===p.worksheet);
 const collection=topic?{path:'/blog/topics/'+topic.slug,name:topic.title}:{path:p.kind==='guide'?'/guides':'/answers',name:p.kind==='guide'?'Guides':'Answers'};
 const related=p.related.map(s=>editorial.find(x=>x.slug===s)).filter((x):x is Editorial=>!!x&&(allowReview||isLaunchArticle(x)));
 const service=services.find(x=>x.service_key===p.service),sector=sectors.find(x=>x.id===p.sector);
 const headings=p.blocks.flatMap((b,i)=>b.type==='heading'?[{id:'section-'+i,text:b.text!}]:[]);
 const schema=graph({path:p.path,title:p.title,description:p.seoDescription,parent:[{path:'/blog',name:'Blog'},collection],extras:[articleNode(p.path,p.title,p.seoDescription,p.blocks.find(b=>b.type==='image')?.src)]});
 return <main id="main"><JsonLd value={schema}/><article><header className="article-header"><div className="container"><Breadcrumb items={[{label:'Blog',href:'/blog'},{label:collection.name,href:collection.path}]}/><div className="article-title"><span className="eyebrow">{launch?'Field notes':p.kind} · {p.category}</span><h1>{p.title}</h1><div className="editorial-byline"><a href="/#about">{p.author}</a><span>{editorialTime(p)} min read</span>{!launch&&<span className="review-label">Editorial preview</span>}</div></div></div></header><div className="container article-layout"><aside className="article-toc"><span className="eyebrow">On this page</span>{headings.map(x=><a key={x.id} href={'#'+x.id}>{x.text}</a>)}</aside><div className="article-body editorial-body"><div className="answer-box"><span className="eyebrow">The short answer</span><p><Inline value={p.answer}/></p></div>{p.blocks.map((b,i)=>b.type==='heading'?<h2 key={i} id={'section-'+i}>{b.text}</h2>:b.type==='subheading'?<h3 key={i}>{b.text}</h3>:b.type==='image'?<figure key={i}><a href={b.src}><img src={b.src} alt={b.alt} loading="lazy" decoding="async"/></a><figcaption>{b.alt}. <a href={b.src}>Open full diagram</a></figcaption></figure>:b.type==='bullets'?<ul key={i}>{b.items?.map((s,j)=><li key={j}><Inline value={s}/></li>)}</ul>:b.text?.split(/\n\n+/).map((s,j)=><p key={i+'-'+j}><Inline value={s}/></p>))}{related.length>0&&<section className="reading-related"><h2>{launch?'Related articles':p.kind==='answer'?'Related guides and answers':'Questions and further reading'}</h2><ul>{related.slice(0,7).map(x=><li key={x.path}><a href={x.path}>{x.title}</a></li>)}</ul></section>}{worksheet&&<p className="reading-tool-link"><strong>Put this into practice:</strong> <a href={'/resources/'+worksheet.slug}>{worksheet.title}</a></p>}<div className="article-end-cta"><h2>Review your website or listings</h2><p>Ask for a review of your public pages, business listings and enquiry routes.</p><EnquiryButton context={{intent:'audit',icp:p.sector??undefined,service:p.service??undefined,source:p.path}}>Request a free audit</EnquiryButton>{service&&<p><a href={service.path}>{service.title}</a>{sector&&<> · <a href={sector.path}>{sector.title}</a></>}</p>}</div></div></div></article></main>;
}
export function WorksheetPage({p,allowReview}:{p:typeof tools[number],allowReview:boolean}){
 const guide=editorial.find(e=>e.slug===p.guide),service=services.find(x=>x.service_key===p.service);
 const related=newArticles.filter(e=>e.worksheet===p.slug).slice(0,3);
 return <main id="main" className="worksheet-page"><JsonLd value={graph({path:'/resources/'+p.slug,title:p.title,description:p.description,parent:[{path:'/resources',name:'Resources'}]})}/><section className="page-hero"><div className="container"><Breadcrumb items={[{label:'Resources',href:'/resources'},{label:p.topic}]}/><span className="eyebrow">Printable worksheet</span><h1>{p.title}</h1><p>{p.description}</p><PrintTool/></div></section><section className="section"><div className="container worksheet-body"><div className="answer-box"><span className="eyebrow">How to use it</span><p>{p.answer}</p></div><div className="worksheet-table"><table><caption>{p.title}: example entries</caption><thead><tr>{p.columns.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{p.rows.map((r,i)=><tr key={i}><th scope="row">{r[0]}</th>{r.slice(1).map((s,j)=><td key={j}>{s}</td>)}</tr>)}</tbody></table></div><h2>Worked example</h2><p>{p.example}</p><h2>Record your findings</h2><div className="worksheet-table worksheet-blank"><table aria-label="Blank worksheet"><thead><tr>{p.columns.map(c=><th key={c} scope="col">{c.replace("Example entry","Your entry").replace(/^Example$/,"Evidence")}</th>)}</tr></thead><tbody>{Array.from({length:4},(_,i)=><tr key={i}>{p.columns.map((c,j)=><td key={c}>{j===0?<span className="worksheet-row-number">{i+1}.</span>:null}</td>)}</tr>)}</tbody></table></div><div className="worksheet-next print-hide">{allowReview&&guide&&<a href={guide.path}>Read the related guide</a>}{service&&<a href={service.path}>{service.title}</a>}<a href="/resources">All resources</a></div>{related.length>0&&<section className="reading-related print-hide"><h2>Where to use this worksheet</h2><ul>{related.map(a=><li key={a.path}><a href={a.path}>{a.title}</a></li>)}</ul></section>}</div></section></main>;
}
