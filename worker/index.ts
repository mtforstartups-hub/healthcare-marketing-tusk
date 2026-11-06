import handler from "vinext/server/fetch-handler";
import {publishedGuideAt} from "../lib/pilot";
import {indexingPolicy} from "../lib/seo-policy";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    const response = await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
    const path=new URL(request.url).pathname;
    const protectedRoute=/^\/(answers|studio|api)(?:\/|$)/.test(path)||(path.startsWith('/guides/')&&!publishedGuideAt(path));
    const noindexRoute=protectedRoute||['/privacy','/terms','/thank-you','/resource-download'].includes(path)||response.status>=400;
    const isDocument=response.headers.get('content-type')?.includes('text/html');
    const blog=path==='/blog';
    if(!protectedRoute&&!blog&&!isDocument&&!noindexRoute)return response;
    const headers=new Headers(response.headers);
    if(protectedRoute||blog||request.headers.has('oai-authenticated-user-id'))headers.set('Cache-Control','private, no-store');
    if(noindexRoute||!indexingPolicy(env).indexing)headers.set('X-Robots-Tag','noindex');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  },
};

export default worker;
