import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const { id, email, password, full_name, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ success: false, error: "User ID and role are required" }, { status: 400 });
    }

    // Role validation
    if (!["super_admin", "author", "reader"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role selected" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Update the user password if provided
    if (password && password.trim().length >= 6) {
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password: password
      });
      if (updateAuthError) throw updateAuthError;
    }

    // 2. Update the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: role, 
        full_name: full_name || null
      })
      .eq('id', id);

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({ success: true, message: "User updated successfully" });

  } catch (error: any) {
    console.error("User Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
