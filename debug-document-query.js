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

async function debugDocumentQuery() {
  try {
    const documentId = '161b16dd-1a48-4cf6-8eba-f6509100fb34';
    console.log(`🔍 Debugging document query for ID: ${documentId}`);
    
    // Test 1: Raw SQL query (what we know works)
    console.log('\n1️⃣ Testing raw SQL query...');
    const rawResult = await client`
      SELECT * FROM "Document" 
      WHERE id = ${documentId}
    `;
    console.log('Raw SQL result:', rawResult.length, 'documents found');
    if (rawResult.length > 0) {
      console.log('Document details:', {
        id: rawResult[0].id,
        title: rawResult[0].title,
        userId: rawResult[0].userId,
        createdAt: rawResult[0].createdAt
      });
    }
    
    // Test 2: Check if there are any special characters or encoding issues
    console.log('\n2️⃣ Testing ID comparison...');
    const allDocs = await client`SELECT id, title FROM "Document" LIMIT 10`;
    console.log('All document IDs:');
    allDocs.forEach((doc, index) => {
      const matches = doc.id === documentId;
      console.log(`${index + 1}. ${doc.id} (matches: ${matches})`);
      if (matches) {
        console.log('   ✅ FOUND MATCH!');
      }
    });
    
    // Test 3: Check the exact query that getDocumentsById would run
    console.log('\n3️⃣ Testing getDocumentsById equivalent query...');
    const getDocumentsResult = await client`
      SELECT * FROM "Document" 
      WHERE id = ${documentId}
      ORDER BY "createdAt" ASC
    `;
    console.log('getDocumentsById equivalent result:', getDocumentsResult.length, 'documents found');
    
    // Test 4: Check document visibility and access
    console.log('\n4️⃣ Testing document visibility...');
    if (rawResult.length > 0) {
      const doc = rawResult[0];
      console.log('Document visibility:', doc.visibility || 'not set');
      console.log('Document organizationId:', doc.organizationId || 'null');
      console.log('Document teamId:', doc.teamId || 'null');
    }
    
    // Test 5: Check the user who owns this document
    if (rawResult.length > 0) {
      console.log('\n5️⃣ Checking document owner...');
      const userId = rawResult[0].userId;
      const user = await client`
        SELECT id, email FROM "User" WHERE id = ${userId}
      `;
      console.log('Document owner:', user.length > 0 ? user[0] : 'User not found');
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

debugDocumentQuery();