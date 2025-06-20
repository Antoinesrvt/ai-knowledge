// This script simulates the document access flow without Stack Auth to debug the issue
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

// Simulate getDocumentsById function
async function getDocumentsById({ id }) {
  try {
    console.log(`📋 Calling getDocumentsById with id: ${id}`);
    const documents = await client`
      SELECT * FROM "Document" 
      WHERE id = ${id}
      ORDER BY "createdAt" ASC
    `;
    console.log(`📋 getDocumentsById returned ${documents.length} documents`);
    if (documents.length > 0) {
      console.log('📋 Document details:', {
        id: documents[0].id,
        title: documents[0].title,
        visibility: documents[0].visibility,
        userId: documents[0].userId,
        createdAt: documents[0].createdAt
      });
    }
    return documents;
  } catch (error) {
    console.error('Database error in getDocumentsById:', {
      id,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    throw error;
  }
}

// Simulate canAccessContent function (simplified version)
function canAccessContent(contentVisibility, contentUserId, currentUserId) {
  console.log(`🔐 Checking access:`);
  console.log(`   - Content visibility: ${contentVisibility}`);
  console.log(`   - Content owner ID: ${contentUserId}`);
  console.log(`   - Current user ID: ${currentUserId || 'null'}`);
  
  // Public content is accessible to everyone
  if (contentVisibility === 'public') {
    console.log('✅ Public content - access granted');
    return true;
  }
  
  // No user authenticated
  if (!currentUserId) {
    console.log('❌ No authenticated user - access denied');
    return false;
  }
  
  // Owner can always access their content
  if (currentUserId === contentUserId) {
    console.log('✅ User is owner - access granted');
    return true;
  }
  
  console.log('❌ User is not owner and content is private - access denied');
  return false;
}

// Test different scenarios
async function testDocumentFlow() {
  try {
    const documentId = '161b16dd-1a48-4cf6-8eba-f6509100fb34';
    const testUserId = '48eb3975-8401-439b-9f29-0576ef3c306d'; // From our previous tests
    
    console.log(`🧪 Testing document flow for ID: ${documentId}\n`);
    
    // Step 1: Get the document
    console.log('=== STEP 1: Fetch Document ===');
    const documents = await getDocumentsById({ id: documentId });
    const document = documents[0];
    
    if (!document) {
      console.log('❌ Document not found - would call notFound()');
      return;
    }
    console.log('');
    
    // Step 2: Test access scenarios
    console.log('=== STEP 2: Access Control Tests ===');
    
    // Test 1: No user (unauthenticated)
    console.log('\n🧪 Test 1: Unauthenticated user');
    const access1 = canAccessContent(document.visibility, document.userId, null);
    
    // Test 2: Wrong user (different user ID)
    console.log('\n🧪 Test 2: Different user');
    const wrongUserId = 'different-user-id';
    const access2 = canAccessContent(document.visibility, document.userId, wrongUserId);
    
    // Test 3: Correct user (owner)
    console.log('\n🧪 Test 3: Document owner');
    const access3 = canAccessContent(document.visibility, document.userId, testUserId);
    
    // Test 4: If document was public
    console.log('\n🧪 Test 4: If document was public');
    const access4 = canAccessContent('public', document.userId, null);
    
    console.log('\n=== SUMMARY ===');
    console.log(`Document ID: ${document.id}`);
    console.log(`Document visibility: ${document.visibility}`);
    console.log(`Document owner: ${document.userId}`);
    console.log(`Test user ID: ${testUserId}`);
    console.log(`Access results:`);
    console.log(`  - Unauthenticated: ${access1}`);
    console.log(`  - Different user: ${access2}`);
    console.log(`  - Document owner: ${access3}`);
    console.log(`  - If public: ${access4}`);
    
    // Check if the test user is actually the owner
    if (document.userId === testUserId) {
      console.log('\n✅ The test user IS the document owner');
      console.log('🤔 The issue might be in Stack Auth authentication, not access control');
    } else {
      console.log('\n❌ The test user is NOT the document owner');
      console.log('🤔 This explains why access is denied');
    }
    
  } catch (error) {
    console.error('❌ Error in test flow:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

testDocumentFlow();