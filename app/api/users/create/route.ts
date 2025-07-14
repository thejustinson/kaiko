import supabase from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email_address, username, privy_id, bio, avatar_type, avatar, wallet_address } = body;

    // Validate required fields
    if (!email_address || !username || !privy_id) {
      return NextResponse.json(
        { error: "Missing required fields: email_address, username, privy_id" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("privy_id", privy_id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert({
        email_address,
        username,
        privy_id: privy_id,
        bio: bio || null,
        avatar_type: avatar_type || "default",
        avatar,
        wallet_address
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      user: data
    }, { status: 201 });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}