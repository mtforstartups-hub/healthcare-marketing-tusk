import {chatGPTSignInPath,getChatGPTUser} from '../../chatgpt-auth';

export const dynamic='force-dynamic';
export const metadata={title:'Set up owner access | Marketing Tusk Healthcare',robots:{index:false,follow:false}};

export default async function StudioAccess(){
 const user=await getChatGPTUser();
 return <main id="main"><section className="section utility-section"><div className="container narrow">
 <h1>Set up owner access</h1>
 {user?<><p>This is the site ID for your signed-in account.</p><p><code style={{overflowWrap:'anywhere'}}>{user.userId}</code></p><p>The site owner can set this ID as <code>ADMIN_USER_ID</code> in the Sites runtime settings to grant access to the inbox and editorial review.</p></>:<><p>Sign in with the account that owns this website to retrieve its site ID.</p><a className="button primary" href={chatGPTSignInPath('/studio/access')} target="_top">Sign in with ChatGPT</a></>}
 <p><a href="/studio">Back to the enquiry inbox</a></p>
 </div></section></main>;
}
