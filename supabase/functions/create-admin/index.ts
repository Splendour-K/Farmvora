import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'skalu@farmvora.com',
      password: '123456789',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Farm Vora Admin',
      },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update the user's app metadata to include admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      {
        app_metadata: { role: 'admin' },
      }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        userId: authData.user.id,
        email: 'skalu@farmvora.com',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
