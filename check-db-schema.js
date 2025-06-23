const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const sql = postgres(process.env.POSTGRES_URL);

  try {
    console.log('Connected to database');
    
    // Check Document table schema
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Document' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\nDocument table columns:');
    console.table(result);
    
    // Check if currentMainChatId exists
    const hasCurrentMainChatId = result.some(row => row.column_name === 'currentMainChatId');
    console.log(`\ncurrentMainChatId exists: ${hasCurrentMainChatId}`);
    
    // Check Chat table for workspaceType
    const chatResult = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Chat' AND column_name = 'workspaceType'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nChat table workspaceType column:');
    console.table(chatResult);
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await sql.end();
  }
}

checkSchema();