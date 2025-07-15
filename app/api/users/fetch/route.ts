import supabase from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const privy_id = searchParams.get("privy_id");
  const intent = searchParams.get("intent") || 'fetch-user';

  if (!privy_id) {
    return NextResponse.json({ error: "Missing privy_id" }, { status: 400 });
  }

  // Fetch user from DB
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("privy_id", privy_id)
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

  if(intent === 'fetch-hub-data'){
    // --- HUB DATA FETCHING ---
    // This block fetches all the data needed for the user's hub/dashboard view.
    // It includes user profile, friends, games, recent sessions, and chat summaries.
    // For production, consider batching queries, caching, and using database views/RPCs for performance.

    // 1. User profile is already fetched above as 'user'.
    console.log(user)

    // 2. Fetch friends (accepted friendships, both as requester and addressee)
    const { data: friends, error: friendsError } = await supabase
      .from("friendships")
      .select(`
        id, status, requester_id, addressee_id, created_at,
        requester:requester_id (id, username, avatar, avatar_type),
        addressee:addressee_id (id, username, avatar, avatar_type)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    // 3. Fetch all active games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true);

    // 4. Fetch user's recent or active game sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("game_session_players")
      .select(`
        session_id,
        game_sessions:session_id (
          id, game_id, status, started_at, completed_at, created_at,
          games:game_id (id, name, game_type)
        )
      `)
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(10);

    // 5. Fetch user's chats (direct and group)
    const { data: chats, error: chatsError } = await supabase
      .from("chat_participants")
      .select(`
        chat_id,
        chats:chat_id (
          id, name, chat_type, created_at, updated_at
        )
      `)
      .eq("user_id", user.id);

    // 6. Fetch recent messages and unread counts for each chat
    // NOTE: This is N+1 and not optimal for production. Use a view/RPC for batching.
    const chatDetails = [];
    if (chats) {
      for (const cp of chats) {
        // Get last message in the chat
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", cp.chat_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count for this user in this chat
        const { data: participant } = await supabase
          .from("chat_participants")
          .select("last_read_at")
          .eq("chat_id", cp.chat_id)
          .eq("user_id", user.id)
          .single();

        let unreadCount = 0;
        if (participant && participant.last_read_at) {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("chat_id", cp.chat_id)
            .gt("created_at", participant.last_read_at);
          unreadCount = count || 0;
        }

        chatDetails.push({
          ...cp.chats,
          lastMessage,
          unreadCount,
        });
      }
    }

    // 7. Error handling: If any error, return a 500
    if (error || friendsError || gamesError || sessionsError || chatsError) {
      return NextResponse.json({
        error: error?.message || friendsError?.message || gamesError?.message || sessionsError?.message || chatsError?.message
      }, { status: 500 });
    }

    // 8. Return all hub data. If any section is empty, frontend should show a friendly message (e.g. "No chats yet. Add a friend to start texting")
    // 9. SUGGESTION: For production, cache this response and use websockets for real-time updates.
    return NextResponse.json({
      status: 'successful',
      user,
      friends,
      games,
      sessions,
      chats: chatDetails,
    });
  }

  // If intent is not recognized
  return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
}