import {HomePage} from '../components/pages';
import {JsonLd} from '../components/seo';
import {pageAt} from '../lib/content';
import {basePageMeta,baseGraph} from '../lib/seo';
const page=pageAt('/')!;
export const metadata=basePageMeta(page);
export default function Home(){return <><JsonLd value={baseGraph(page)}/><HomePage/></>}
