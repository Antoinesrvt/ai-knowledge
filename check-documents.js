const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=');
      }
    }
  });
} catch (error) {
  console.error('Failed to load .env.local:', error.message);
}

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(process.env.POSTGRES_URL);

async function checkDocuments() {
  try {
    console.log('Checking documents in database...');
    
    // Check documents
    const docs = await client`SELECT * FROM "Document" LIMIT 10`;
    console.log('\n📄 Documents found:', docs.length);
    if (docs.length > 0) {
      console.log('Documents:');
      docs.forEach((doc, index) => {
        console.log(`${index + 1}. ID: ${doc.id}, Title: ${doc.title}, Created: ${doc.createdAt}`);
      });
    } else {
      console.log('No documents found in database.');
    }
    
    // Check document versions
    const versions = await client`SELECT * FROM "DocumentVersion" LIMIT 5`;
    console.log('\n📝 Document versions found:', versions.length);
    
    // Check document branches
    const branches = await client`SELECT * FROM "DocumentBranch" LIMIT 5`;
    console.log('🌿 Document branches found:', branches.length);
    
    // Check if the specific document ID exists
    const specificDoc = await client`
      SELECT * FROM "Document" 
      WHERE id = '161b16dd-1a48-4cf6-8eba-f6509100fb34'
    `;
    console.log('\n🔍 Specific document (161b16dd-1a48-4cf6-8eba-f6509100fb34) exists:', specificDoc.length > 0);
    
  } catch (error) {
    console.error('❌ Error checking documents:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkDocuments();