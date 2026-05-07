import { readFileSync } from 'fs';
import mysql from 'mysql2/promise';

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname, port: parseInt(url.port) || 3306,
    user: url.username, password: url.password,
    database: url.pathname.slice(1), ssl: { rejectUnauthorized: false },
    charset: 'utf8mb4'
  });

  const p = JSON.parse(readFileSync('/home/ubuntu/fixed_envy_post.json', 'utf8'));
  
  // Try with explicit text cast
  try {
    await conn.execute(
      `INSERT INTO blog_posts (slug, title, metaDescription, keywords, category, priority, content, readingTime, published, publishedAt, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, CAST(? AS CHAR), ?, 1, NOW(), NOW(), NOW())
       ON DUPLICATE KEY UPDATE content = VALUES(content)`,
      [p.slug, p.title, (p.metaDescription||'').slice(0,320), p.keywords||'', p.category||'general', p.priority||'medium', p.content, p.readingTime||5]
    );
    console.log('OK:', p.slug);
  } catch (e) {
    console.log('FAIL:', e.message);
    // Try with simpler content
    const simpleContent = p.content.replace(/[^\x00-\x7F]/g, '');
    try {
      await conn.execute(
        `INSERT INTO blog_posts (slug, title, metaDescription, keywords, category, priority, content, readingTime, published, publishedAt, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE content = VALUES(content)`,
        [p.slug, p.title, (p.metaDescription||'').slice(0,320), p.keywords||'', p.category||'general', p.priority||'medium', simpleContent, p.readingTime||5]
      );
      console.log('OK with ASCII-only:', p.slug);
    } catch (e2) {
      console.log('FAIL again:', e2.message);
    }
  }

  const [count] = await conn.execute('SELECT COUNT(*) as total FROM blog_posts');
  console.log('Total posts now:', count[0].total);
  await conn.end();
}
main();
