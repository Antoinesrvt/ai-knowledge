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

console.log('Testing getChatsByUserId query with raw SQL...');

const client = postgres(process.env.POSTGRES_URL);

async function testGetChatsByUserId() {
  try {
    // Test with the exact user ID from the error
    const testUserId = 'f5bcac98-b54a-4bfc-bd01-92e92914a84f';
    
    console.log(`Testing query for userId: ${testUserId}`);
    
    // Check if user exists
    const userCheck = await client`
      SELECT id, email FROM "User" WHERE id = ${testUserId}
    `;
    console.log('User exists:', userCheck.length > 0 ? userCheck[0] : 'No user found');
    
    // Test the exact query that's failing
    console.log('Executing Chat query...');
    const chatResult = await client`
      SELECT * FROM "Chat" 
      WHERE "userId" = ${testUserId}
      ORDER BY "createdAt" DESC
      LIMIT 21
    `;
    
    console.log('✅ Query executed successfully');
    console.log('Number of chats found:', chatResult.length);
    console.log('Chats:', chatResult);
    
    // Check all chats
    const allChats = await client`SELECT * FROM "Chat" LIMIT 5`;
    console.log('All chats (first 5):', allChats);
    
    // Check all users
    const allUsers = await client`SELECT id, email FROM "User" LIMIT 5`;
    console.log('All users (first 5):', allUsers);
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

testGetChatsByUserId();