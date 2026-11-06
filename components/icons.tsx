import type {CSSProperties} from 'react';
export function Icon({name='arrow',size=24,className='',style}:{name?:string,size?:number,className?:string,style?:CSSProperties}) {
 const shapes:Record<string,React.ReactNode>={
 arrow:<><path d="M5 12h14M13 6l6 6-6 6"/></>, diagonal:<><path d="M6 18 18 6M6 6h12v12"/></>,
 check:<path d="m5 12 4 4L19 6"/>, close:<path d="m6 6 12 12M18 6 6 18"/>, plus:<path d="M12 5v14M5 12h14"/>,chevron:<path d="m6 9 6 6 6-6"/>,
 browser:<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M7 13h4M7 16h8"/></>,
 scan:<><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M3 12h18"/><path d="m9 15 2 2 4-4"/></>,
 pen:<><path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15l-1 5Z"/><path d="M12 20h8"/></>,
 pin:<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
 search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 11h5M10.5 8.5v5"/></>,
 spark:<><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3ZM20 2v4M18 4h4"/></>,
 grid:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
 shield:<><path d="M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7l-9-4Z"/><path d="m8 12 3 3 5-6"/></>,
 chart:<><path d="M4 3v17h17M8 15l4-5 4 2 5-7"/><path d="M17 5h4v4"/></>,
 heart:<path d="M20.8 5.6a5.4 5.4 0 0 0-7.6 0L12 6.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/>,
 tooth:<path d="M7 3C3 3 2 7 4 11c1 2 1 10 4 10 2 0 1-7 4-7s2 7 4 7c3 0 3-8 4-10 2-4 1-8-3-8-2 0-3 1-5 1S9 3 7 3Z"/>,
 activity:<><path d="M2 12h5l3-9 4 18 3-9h5"/></>,
 leaf:<><path d="M20 3C8 2 3 8 4 14c1 5 7 7 11 3 4-4 3-8 5-14Z"/><path d="M3 22 15 10"/></>,
 flower:<><circle cx="12" cy="12" r="3"/><path d="M9 6c-2-7 8-7 6 0 7-3 10 6 3 8 6 4-1 11-6 5-4 6-12 0-6-5-7-1-5-11 3-8Z"/></>,
 eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
 cross:<><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z"/></>,
 hospital:<><rect x="4" y="4" width="16" height="18" rx="2"/><path d="M9 22v-5h6v5M12 7v6M9 10h6"/></>,
 home:<><path d="m3 10 9-7 9 7v11H3V10Z"/><path d="M9 21v-7h6v7"/></>,
 book:<><path d="M12 5v16M3 3c5 0 7 0 9 2 2-2 4-2 9-2v16c-5 0-7 0-9 2-2-2-4-2-9-2V3Z"/></>,
 paw:<><ellipse cx="12" cy="16" rx="5" ry="4"/><ellipse cx="5" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3"/><ellipse cx="20" cy="11" rx="2" ry="3"/></>,
 mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
 phone:<path d="M21 16v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2h3l2 5-3 2a13 13 0 0 0 7 7l2-3 5 2Z"/>,
 download:<><path d="M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 menu:<path d="M3 6h18M3 12h18M3 18h18"/>,
 file:<><path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/></>,
 globe:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>
 };
 return <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]||shapes.browser}</svg>;
}
