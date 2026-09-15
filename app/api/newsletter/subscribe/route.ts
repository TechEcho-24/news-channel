import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key server-side so RLS doesn't block anonymous inserts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, preferences } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('subscribers')
      .upsert(
        {
          email: normalizedEmail,
          preferences: preferences || ['Breaking News', 'Daily News Digest'],
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('[NEWSLETTER] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to save subscription. Please try again.' }, { status: 500 });
    }

    console.log(`[NEWSLETTER] Subscribed: ${normalizedEmail}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[NEWSLETTER] Unexpected error:', err.message);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
