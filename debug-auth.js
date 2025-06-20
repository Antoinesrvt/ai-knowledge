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

async function debugAuth() {
  try {
    const documentId = '161b16dd-1a48-4cf6-8eba-f6509100fb34';
    console.log(`🔍 Debugging authentication for document: ${documentId}`);
    
    // Get the document details
    const doc = await client`
      SELECT * FROM "Document" 
      WHERE id = ${documentId}
    `;
    
    if (doc.length === 0) {
      console.log('❌ Document not found');
      return;
    }
    
    const document = doc[0];
    console.log('\n📄 Document details:');
    console.log('- ID:', document.id);
    console.log('- Title:', document.title);
    console.log('- Visibility:', document.visibility);
    console.log('- Owner ID:', document.userId);
    console.log('- Organization ID:', document.organizationId || 'null');
    console.log('- Team ID:', document.teamId || 'null');
    
    // Get the owner details
    const owner = await client`
      SELECT id, email FROM "User" 
      WHERE id = ${document.userId}
    `;
    
    console.log('\n👤 Document owner:');
    if (owner.length > 0) {
      console.log('- Email:', owner[0].email);
      console.log('- ID:', owner[0].id);
    } else {
      console.log('❌ Owner not found');
    }
    
    // Simulate access control logic
    console.log('\n🔐 Access control analysis:');
    console.log('- Document visibility:', document.visibility);
    
    if (document.visibility === 'public') {
      console.log('✅ PUBLIC document - should be accessible to everyone');
    } else if (document.visibility === 'private') {
      console.log('🔒 PRIVATE document - only accessible to owner');
      console.log('- Owner must be authenticated and match userId:', document.userId);
    } else if (document.visibility === 'organization') {
      console.log('🏢 ORGANIZATION document - requires org membership');
      console.log('- Organization ID:', document.organizationId);
    } else if (document.visibility === 'team') {
      console.log('👥 TEAM document - requires team membership');
      console.log('- Team ID:', document.teamId);
    }
    
    // Check if there are any sessions or auth tokens
    console.log('\n🍪 Checking for auth-related data...');
    
    // Check for any session-related tables
    try {
      const sessions = await client`
        SELECT * FROM "Session" LIMIT 5
      `;
      console.log('Sessions found:', sessions.length);
    } catch (e) {
      console.log('No Session table found');
    }
    
    try {
      const accounts = await client`
        SELECT * FROM "Account" LIMIT 5
      `;
      console.log('Accounts found:', accounts.length);
    } catch (e) {
      console.log('No Account table found');
    }
    
  } catch (error) {
    console.error('❌ Error in auth debug:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

debugAuth();