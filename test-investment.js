// Test Investment Flow
// Open browser console and paste this to test investment functionality

async function testInvestmentFlow() {
  console.log('=== Testing Investment Flow ===');
  
  // Get Supabase client from window
  const supabase = window.supabase;
  if (!supabase) {
    console.error('Supabase client not found on window object');
    return;
  }
  
  // Check current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Not logged in:', userError);
    return;
  }
  console.log('✓ Logged in as:', user.email);
  
  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.error('Profile error:', profileError);
    return;
  }
  console.log('✓ Profile:', profile);
  
  // List all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, status')
    .limit(5);
    
  if (projectsError) {
    console.error('Projects error:', projectsError);
    return;
  }
  console.log('✓ Projects:', projects);
  
  // Check existing investments
  const { data: investments, error: investError } = await supabase
    .from('investments')
    .select('*')
    .eq('investor_id', user.id);
    
  if (investError) {
    console.error('Investments error:', investError);
  } else {
    console.log('✓ Your investments:', investments);
  }
  
  console.log('\n=== To create a test investment ===');
  console.log('Use this code (replace PROJECT_ID):');
  console.log(`
const { data, error } = await supabase.from('investments').insert({
  investor_id: '${user.id}',
  project_id: 'PROJECT_ID_HERE',
  amount: 1000,
  expected_return: 150,
  status: 'pending'
}).select();

if (error) {
  console.error('Error:', error);
} else {
  console.log('Success:', data);
}
  `);
}

// Run the test
testInvestmentFlow();
