// Test Supabase Connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testSupabaseConnection() {
  console.log('\n' + colors.blue + '🔍 Testing Supabase Connection...' + colors.reset + '\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log(colors.red + '❌ ERROR: Missing environment variables!' + colors.reset);
    console.log(colors.yellow + '\nPlease check your backend/.env file:' + colors.reset);
    console.log('- SUPABASE_URL=' + (supabaseUrl ? colors.green + '✓' : colors.red + '✗') + colors.reset);
    console.log('- SUPABASE_SERVICE_ROLE_KEY=' + (supabaseKey ? colors.green + '✓' : colors.red + '✗') + colors.reset);
    process.exit(1);
  }

  console.log(colors.green + '✓ Environment variables found' + colors.reset);
  console.log('  URL:', supabaseUrl);
  console.log('  Key:', supabaseKey.substring(0, 20) + '...\n');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Check connection by querying users table
    console.log(colors.blue + 'Test 1: Checking connection...' + colors.reset);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.log(colors.red + '❌ Connection failed: ' + usersError.message + colors.reset);
      
      if (usersError.message.includes('relation "users" does not exist')) {
        console.log(colors.yellow + '\n⚠️  Tables not created yet!' + colors.reset);
        console.log('Please run the SQL scripts from SUPABASE_SETUP_GUIDE.md\n');
      }
      
      process.exit(1);
    }

    console.log(colors.green + '✅ Connection successful!\n' + colors.reset);

    // Test 2: List all tables
    console.log(colors.blue + 'Test 2: Checking database tables...' + colors.reset);
    
    const tables = ['users', 'matches', 'classrooms', 'reviews'];
    let allTablesExist = true;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(colors.red + `  ❌ Table "${table}" - ${error.message}` + colors.reset);
        allTablesExist = false;
      } else {
        console.log(colors.green + `  ✓ Table "${table}" exists` + colors.reset);
      }
    }

    if (!allTablesExist) {
      console.log(colors.yellow + '\n⚠️  Some tables are missing!' + colors.reset);
      console.log('Please run the SQL scripts from SUPABASE_SETUP_GUIDE.md\n');
      process.exit(1);
    }

    console.log(colors.green + '\n✅ All tables exist!\n' + colors.reset);

    // Test 3: Count existing records
    console.log(colors.blue + 'Test 3: Checking data...' + colors.reset);
    
    const { data: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { data: matchCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true });

    console.log(`  Users: ${userCount?.length || 0}`);
    console.log(`  Matches: ${matchCount?.length || 0}`);

    // Success summary
    console.log('\n' + colors.green + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(colors.green + '✅ SUPABASE CONNECTION TEST PASSED!' + colors.reset);
    console.log(colors.green + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log('\n' + colors.blue + '🚀 Your Maven backend is ready to use Supabase!' + colors.reset);
    console.log('\nNext steps:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: cd ../frontend && npm run dev');
    console.log('3. Open http://localhost:5173\n');

  } catch (error) {
    console.log(colors.red + '\n❌ Test failed with error:' + colors.reset);
    console.log(error.message);
    console.log('\nPlease check:');
    console.log('- Your SUPABASE_URL is correct');
    console.log('- Your SUPABASE_SERVICE_ROLE_KEY is correct');
    console.log('- You have created the tables in Supabase\n');
    process.exit(1);
  }
}

// Run the test
testSupabaseConnection();
