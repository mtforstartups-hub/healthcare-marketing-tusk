import {notFound} from 'next/navigation';
import {canManageEnquiries} from '../../../lib/admin';
import {reviewEditorial} from '../../../lib/editorial';
import {guidePath,pilotGuides} from '../../../lib/pilot';

export const dynamic='force-dynamic';
export const metadata={title:'Editorial Review | Marketing Tusk Healthcare',robots:{index:false,follow:false}};

export default async function EditorialStudio(){
 if(!await canManageEnquiries())notFound();
 const releaseGroups=[2,3,4].map(release=>({
  release,records:reviewEditorial.filter(p=>p.release===release),
 }));
 const weeks=[...new Set(pilotGuides.map(p=>p.week))];
 return <main id="main" className="pilot-studio"><section className="page-hero"><div className="container">
 <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/studio">Enquiry inbox</a><span aria-current="page">Editorial review</span></nav>
 <span className="eyebrow">Owner workspace</span><h1>Healthcare editorial register</h1>
 <p>24 approved guides. This register preserves the original 12-week planning order.</p>
 <p>Open an entry to see its search metadata and editorial notes, or read the public version.</p>
 </div></section>
 <section className="section"><div className="container">
 <h2>Editorial release queue</h2><p>Releases 02, 03 and 04 are in review. Open any guide or answer to check its content and links before publication.</p>
 <div className="pilot-weeks">{releaseGroups.map(({release,records})=><section className="pilot-week" key={release}>
 <h3>Release {String(release).padStart(2,'0')}</h3>
 <p>{records.filter(p=>p.kind==='guide').length} guides · {records.filter(p=>p.kind==='answer').length} answers</p>
 <details><summary>Browse records</summary><ul>{records.map(p=><li key={p.path}><a href={p.path}>{p.title}</a><span>{p.kind==='guide'?'Guide':'Answer'} · In review</span></li>)}</ul></details>
 </section>)}</div></div></section>
 <section className="section"><div className="container"><h2>Published guide register</h2><div className="pilot-weeks">
 {weeks.map(week=><section key={week} className="pilot-week"><h2>Week {week}</h2>
 <ul>{pilotGuides.filter(p=>p.week===week).map(p=><li key={p.id}><a href={'/studio/editorial/'+p.slug}>{p.title}</a><span>{p.topicId} · Published · {p.category}</span><span><a href={guidePath(p)}>Read public guide</a></span></li>)}</ul>
 </section>)}
 </div></div></section></main>;
}
