# IndexNow Implementation Notes

## User's API Key
`505b6460d365492eabc067eac9bfe230`

## Protocol Requirements
1. **Key file**: Host `{key}.txt` at root of domain containing the key text
   - URL: `https://www.7sinscardgame.com/505b6460d365492eabc067eac9bfe230.txt`
   - Content: `505b6460d365492eabc067eac9bfe230`

2. **Single URL submission** (GET):
   ```
   https://api.indexnow.org/indexnow?url={url}&key={key}
   ```

3. **Batch URL submission** (POST JSON):
   ```json
   POST https://api.indexnow.org/indexnow
   {
     "host": "www.7sinscardgame.com",
     "key": "505b6460d365492eabc067eac9bfe230",
     "urlList": ["url1", "url2", ...]
   }
   ```
   - Up to 10,000 URLs per POST
   - Shared across all participating engines (Bing, Yandex, Naver, Seznam, Yep)

4. **Response codes**: 200=OK, 202=Accepted, 400=Bad, 403=Forbidden, 422=Invalid, 429=TooMany

## Implementation Plan
- Host key file at `/505b6460d365492eabc067eac9bfe230.txt` via client/public
- Create `server/indexnow.ts` helper with `submitUrls(urls: string[])` function
- Auto-submit when blog posts are published/updated (hook into blog.create/update procedures)
- Add admin tRPC procedure for manual bulk submission of all site URLs
- Submit to `api.indexnow.org` (auto-shared with all engines)
