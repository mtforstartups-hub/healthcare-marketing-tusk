import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';

export async function canManageEnquiries(){
 const user=await getChatGPTUser();
 const owner=env.ADMIN_USER_ID?.trim();
 // Platform sign-in proves identity. Audience and search settings never grant owner privileges.
 return !!user&&!!owner&&user.userId===owner;
}
