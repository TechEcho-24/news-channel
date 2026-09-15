import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ isSubscribed: false }, { status: 400 });
    }

    const { data } = await supabaseAdmin
      .from('subscribers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    return NextResponse.json({ isSubscribed: !!data });
  } catch (err: any) {
    console.error('[NEWSLETTER CHECK] Error:', err.message);
    return NextResponse.json({ isSubscribed: false }, { status: 500 });
  }
}
