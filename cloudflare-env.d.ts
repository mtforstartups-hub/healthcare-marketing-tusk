declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    INTAKE_ENCRYPTION_KEY?: string;
    SITE_ACCESS_MODE?: string;
    SEO_INDEXING?: string;
    SEO_PUBLIC_ORIGIN?: string;
    ADMIN_USER_ID?: string;
    CRM_WEBHOOK_URL?: string;
    CRM_WEBHOOK_SECRET?: string;
  }
}
