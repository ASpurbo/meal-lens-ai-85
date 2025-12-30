import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to get user info
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("User not found:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deleting account for user:", user.id);

    // Create admin client to delete user data and auth account
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Delete user data from all tables
    console.log("Deleting user data...");
    
    // Delete in order to respect foreign key constraints
    await supabaseAdmin.from("mood_logs").delete().eq("user_id", user.id);
    await supabaseAdmin.from("shared_meals").delete().eq("user_id", user.id);
    await supabaseAdmin.from("meal_analyses").delete().eq("user_id", user.id);
    await supabaseAdmin.from("nutrition_goals").delete().eq("user_id", user.id);
    await supabaseAdmin.from("user_challenge_progress").delete().eq("user_id", user.id);
    await supabaseAdmin.from("user_badges").delete().eq("user_id", user.id);
    await supabaseAdmin.from("user_streaks").delete().eq("user_id", user.id);
    await supabaseAdmin.from("email_verification_tokens").delete().eq("user_id", user.id);
    await supabaseAdmin.from("profiles").delete().eq("user_id", user.id);

    console.log("User data deleted");

    // Delete avatar files from storage
    try {
      await supabaseAdmin.storage.from("avatars").remove([
        `${user.id}/avatar.jpg`,
        `${user.id}/avatar.png`,
        `${user.id}/avatar.jpeg`,
        `${user.id}/avatar.webp`
      ]);
      console.log("Avatar files deleted");
    } catch (storageError) {
      console.log("No avatar files to delete or error:", storageError);
    }

    // Delete the user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      throw new Error("Failed to delete account");
    }

    console.log("Auth user deleted successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in delete-account:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
