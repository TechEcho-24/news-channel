import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const email = "anujsachan98@gmail.com";
    const password = "AnujSachan@123#";

    // 1. Check if user already exists
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) throw usersError;

    const existingUser = usersData.users.find(u => u.email === email);
    
    let userId;

    if (existingUser) {
      userId = existingUser.id;
      // Force update password just in case
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
    } else {
      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Anuj Sachan", role: "super_admin" }
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // 2. Ensure they are a super_admin in the profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        role: 'super_admin',
        full_name: 'Anuj Sachan'
      });

    if (profileError) throw profileError;

    return NextResponse.json({ 
      success: true, 
      message: "Super Admin account setup complete! You can now log in." 
    });

  } catch (error: any) {
    console.error("Setup Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
