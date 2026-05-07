import { readFileSync } from 'fs';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  // Parse DATABASE_URL
  const url = new URL(DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  // Get existing slugs
  const [existingRows] = await conn.execute('SELECT slug FROM blog_posts');
  const existingSlugs = new Set(existingRows.map(r => r.slug));
  console.log(`Existing posts in DB: ${existingSlugs.size}`);

  // Load generated posts
  const posts = JSON.parse(readFileSync('/home/ubuntu/all_posts_final.json', 'utf8'));
  console.log(`Total generated posts: ${posts.length}`);

  // Filter out duplicates
  const newPosts = posts.filter(p => !existingSlugs.has(p.slug));
  console.log(`New posts to insert: ${newPosts.length}`);

  if (newPosts.length === 0) {
    console.log('Nothing to insert');
    await conn.end();
    return;
  }

  // Insert in batches of 20
  const BATCH_SIZE = 20;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < newPosts.length; i += BATCH_SIZE) {
    const batch = newPosts.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];

    for (const p of batch) {
      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW(), NOW())');
      values.push(
        p.slug || '',
        p.title || '',
        (p.metaDescription || '').slice(0, 320),
        p.keywords || '',
        p.category || 'general',
        p.priority || 'medium',
        p.content || '',
        p.readingTime || 5
      );
    }

    const sql = `INSERT IGNORE INTO blog_posts (slug, title, metaDescription, keywords, category, priority, content, readingTime, published, publishedAt, createdAt, updatedAt) VALUES ${placeholders.join(', ')}`;

    try {
      const [result] = await conn.execute(sql, values);
      inserted += result.affectedRows;
      process.stdout.write(`\r  Inserted ${inserted}/${newPosts.length} (batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(newPosts.length/BATCH_SIZE)})`);
    } catch (err) {
      errors++;
      console.error(`\n  Batch error: ${err.message}`);
    }
  }

  console.log(`\n\nDone! Inserted: ${inserted}, Errors: ${errors}`);

  // Final count
  const [countRows] = await conn.execute('SELECT COUNT(*) as total FROM blog_posts');
  console.log(`Total posts in DB: ${countRows[0].total}`);

  await conn.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
