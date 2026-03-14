import { readFileSync } from 'fs';
import mysql from 'mysql2/promise';

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname, port: parseInt(url.port) || 3306,
    user: url.username, password: url.password,
    database: url.pathname.slice(1), ssl: { rejectUnauthorized: false }
  });

  const [rows] = await conn.execute('SELECT slug FROM blog_posts');
  const existingSlugs = new Set(rows.map(r => r.slug));

  const posts = JSON.parse(readFileSync('/home/ubuntu/all_posts_final.json', 'utf8'));
  const missing = posts.filter(p => {
    return !existingSlugs.has(p.slug);
  });
  console.log('Missing posts:', missing.length);

  for (const p of missing) {
    const content = (p.content || '').slice(0, 60000);
    try {
      await conn.execute(
        'INSERT IGNORE INTO blog_posts (slug, title, metaDescription, keywords, category, priority, content, readingTime, published, publishedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW(), NOW())',
        [p.slug, p.title, (p.metaDescription||'').slice(0,320), p.keywords||'', p.category||'general', p.priority||'medium', content, p.readingTime||5]
      );
      console.log('  OK:', p.slug);
    } catch (e) {
      console.log('  FAIL:', p.slug, e.message.slice(0,100));
    }
  }

  const [count] = await conn.execute('SELECT COUNT(*) as total FROM blog_posts');
  console.log('Total posts now:', count[0].total);
  await conn.end();
}
main();
