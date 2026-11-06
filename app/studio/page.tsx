import {canManageEnquiries} from '../../lib/admin';
import {chatGPTSignInPath,getChatGPTUser} from '../chatgpt-auth';
import Studio from '../../components/studio';
export const dynamic='force-dynamic';
export const metadata={title:'Enquiry Inbox | Marketing Tusk Healthcare',robots:{index:false,follow:false}};
export default async function StudioPage(){if(await canManageEnquiries())return <><div className="container studio-links"><a href="/studio/editorial">Editorial register: 24 healthcare guides</a></div><Studio/></>;const user=await getChatGPTUser();return <main id="main"><section className="section utility-section"><div className="container narrow"><span className="eyebrow">OWNER WORKSPACE</span><h1>Your enquiry inbox.</h1><p>{user?'This workspace is available to the site owner.':'Sign in with the owner’s ChatGPT account to view and manage enquiries.'}</p>{!user&&<a className="button primary" href={chatGPTSignInPath('/studio')} target="_top">Sign in with ChatGPT</a>}<p><a href="/studio/access">Set up owner access</a></p></div></section></main>}
