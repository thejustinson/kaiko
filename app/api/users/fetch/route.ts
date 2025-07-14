import supabase from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const privyId = searchParams.get("privyId");
  const intent = searchParams.get("intent") || 'fetch-user';

  if (!privyId) {
    return NextResponse.json({ error: "Missing privyId" }, { status: 400 });
  }

  // Fetch user from DB
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("privy_id", privyId)
    .single();

  if (intent === 'confirm') {
    if (error && error.code === 'PGRST116') {
      // User does not exist
      return NextResponse.json({
        status: 'successful',
        exists: false
      });
    }
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      status: 'successful',
      exists: !!user,
      user: user || null
    });
  }

  if (intent === 'fetch-user') {
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      status: 'successful',
      user
    });
  }

  // If intent is not recognized
  return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
}