# DNS Records for drmagedragab.com

Use these records after buying the domain.

## Option A: Vercel Hosting

Public website:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

Admin dashboard:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | admin | cname.vercel-dns.com |

API:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | api | your-backend-host.example |

## Option B: Cloudflare DNS

Use Cloudflare for DNS and keep proxy enabled for website/admin if the hosting supports it.

Recommended DNS names:

- drmagedragab.com
- www.drmagedragab.com
- admin.drmagedragab.com
- api.drmagedragab.com

## Email Records

If using Google Workspace or Microsoft 365, add the MX, SPF, DKIM, and DMARC records from that provider.

Minimum DMARC:

| Type | Name | Value |
| --- | --- | --- |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:admin@drmagedragab.com |

