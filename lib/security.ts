const enc=new TextEncoder();
export const bytesToBase64=(a:Uint8Array)=>btoa(String.fromCharCode(...a));
export const base64ToBytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const hexBytes=(hex:string)=>new Uint8Array(hex.match(/.{2}/g)!.map(x=>parseInt(x,16)));
export async function sealPayload(value:unknown,hex:string){const key=await crypto.subtle.importKey('raw',hexBytes(hex),'AES-GCM',false,['encrypt']);const iv=crypto.getRandomValues(new Uint8Array(12));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(value)));return JSON.stringify({v:1,iv:bytesToBase64(iv),data:bytesToBase64(new Uint8Array(data))})}
export async function openPayload(value:string,hex:string){const r=JSON.parse(value);if(r.v!==1)throw Error('Unknown payload format');const key=await crypto.subtle.importKey('raw',hexBytes(hex),'AES-GCM',false,['decrypt']);const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(r.iv)},key,base64ToBytes(r.data));return JSON.parse(new TextDecoder().decode(bytes))}
export async function hash(value:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function sign(value:string,keyValue:string){const raw=await crypto.subtle.digest('SHA-256',enc.encode('mth-grants-v1:'+keyValue));const key=await crypto.subtle.importKey('raw',raw,{name:'HMAC',hash:'SHA-256'},false,['sign']);return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
export function sameSignature(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
