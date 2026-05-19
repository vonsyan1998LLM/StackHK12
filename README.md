# StackHK Template Management System

This system implements the template injection architecture described in `stackhk-template-architecture.md`. It uses Cloudflare Workers to inject header and footer templates at runtime, so you only need to maintain one copy of each.

## Architecture

```
User Request → Cloudflare Worker → KV (Templates) → Assembled HTML → User
```

## Files Created

- `templates/header.html` - Unified header/nav template
- `templates/footer.html` - Unified footer template  
- `pages/index.html` - Index page skeleton (without header/footer)
- `src/index.js` - Cloudflare Worker code
- `wrangler.toml` - Worker configuration
- `package.json` - Dependencies
- `scripts/populate-kv.js` - Script to populate KV with templates
- `notepage/templates.html` - Admin template management page

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespace

```bash
wrangler kv:namespace create STACKHK
```

This will output something like:
```
{ binding = "STACKHK", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

### 4. Update wrangler.toml

Replace `YOUR_KV_NAMESPACE_ID` with the actual ID from step 3.

### 5. Deploy Worker

```bash
npm run deploy
```

### 6. Populate KV with Templates

Run the populate script to generate the data, then use the API to import it:

```bash
node scripts/populate-kv.js
```

Or manually via the admin interface at `/notepage/templates.html`.

## Admin Interface

Access the template management interface at:
```
https://your-domain.com/notepage/templates.html
```

Features:
- Edit header and footer templates
- Create new page templates
- Preview templates
- One-click publish to KV

## API Endpoints

- `GET /api/templates` - Get all templates
- `POST /api/templates` - Save a template
- `GET /api/pages` - Get all page templates
- `POST /api/pages` - Save a page template

## How It Works

1. **Template Injection**: When a user visits `/index.html`, the Worker:
   - Checks KV for `page:index`
   - Reads `template:header` and `template:footer` from KV
   - Assembles the complete HTML
   - Returns to user

2. **Fallback**: If a page isn't in KV, the Worker falls back to static files.

3. **Admin Management**: The admin interface allows editing templates via the API, which writes directly to KV.

## Benefits

- **Single Source of Truth**: Edit header/footer once, changes apply everywhere
- **Instant Updates**: No rebuild/deploy needed for template changes
- **Performance**: KV is edge-cached globally
- **Flexibility**: Easy to add new pages without duplicating templates

## Next Steps

1. Extract remaining page skeletons from existing HTML files
2. Add SEO meta tags to templates
3. Implement preview functionality with tokens
4. Add template versioning
5. Migrate existing localStorage data to KV