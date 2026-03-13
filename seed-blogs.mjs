import { readFileSync } from 'fs';
import { createConnection } from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: parseInt(url.port || '3306'),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true },
};

async function main() {
  const posts = JSON.parse(readFileSync('/home/ubuntu/all_blog_posts.json', 'utf-8'));
  console.log(`Loaded ${posts.length} blog posts to seed`);

  const conn = await createConnection(config);
  console.log('Connected to database');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    if (!post.content || !post.slug || !post.title) {
      skipped++;
      continue;
    }

    // Map priority values
    let priority = post.priority || 'medium';
    if (!['high', 'medium', 'low'].includes(priority)) {
      priority = 'medium';
    }

    try {
      await conn.execute(
        `INSERT INTO blog_posts (slug, title, metaDescription, keywords, category, priority, content, readingTime, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW()`,
        [
          post.slug,
          post.title,
          post.meta_description || post.description || post.title,
          post.keywords || '',
          post.category || 'general',
          priority,
          post.content,
          post.reading_time || 5,
        ]
      );
      inserted++;
      if (inserted % 10 === 0) {
        console.log(`  Inserted ${inserted}/${posts.length}...`);
      }
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        skipped++;
      } else {
        errors++;
        console.error(`  Error inserting "${post.slug}": ${e.message}`);
      }
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
  await conn.end();
}

main().catch(console.error);
