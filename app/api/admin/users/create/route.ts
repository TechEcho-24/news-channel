import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ success: false, error: "Email, password, and role are required" }, { status: 400 });
    }

    // Role validation
    if (!["super_admin", "author", "reader"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role selected" }, { status: 400 });
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

    // 2. Create the profile manually with the specified role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ 
        id: userId, 
        role: role, 
        full_name: full_name || null
      });

    if (profileError) {
      // Cleanup auth user if profile insertion fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    return NextResponse.json({ success: true, message: "User created successfully" });

  } catch (error: any) {
    console.error("User Creation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
