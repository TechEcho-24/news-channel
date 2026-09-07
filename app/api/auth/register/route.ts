import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Create the user using Admin API to bypass email confirmation
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Bypasses email verification
      user_metadata: { full_name: full_name || "" }
    });

    if (createError) throw createError;
    const userId = newUser.user.id;

    // 2. Create the profile manually (since we removed the trigger)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ 
        id: userId, 
        role: 'reader', // Default role for public signups
        full_name: full_name || null
      });

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, message: "Registration successful" });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
