import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("Request rejected: No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user's JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log("Request rejected: Invalid token", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated request from user: ${user.id}`);

    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[User: ${user.id}] Sending image to AI for analysis...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert nutritionist and food recognition AI. Your task is to accurately identify foods in images and estimate their nutritional content.

CRITICAL IDENTIFICATION RULES:
1. Look VERY carefully at the image before identifying. Consider:
   - Container type (glass, bowl, plate, package, carton)
   - Color and texture of the food/beverage
   - Context clues (kitchen, restaurant, packaging labels)
   - Liquid vs solid state

2. COMMON MISIDENTIFICATIONS TO AVOID:
   - Milk (white liquid in glass/carton) is NOT eggs
   - Yogurt/Skyr is NOT eggs or cream
   - White beverages (milk, plant milk, protein shakes) - identify by container
   - Coffee with milk is NOT soup
   - Oatmeal is NOT rice

3. For BEVERAGES specifically:
   - White liquid in glass = likely milk, plant milk, or protein shake
   - Check for carton/bottle labels if visible
   - Consider typical serving sizes (250ml glass, 500ml bottle)

4. For PACKAGED FOODS:
   - Try to read any visible labels or brand names
   - Use packaging design to help identify the product

ALWAYS respond with ONLY valid JSON in this exact format:
{
  "foods": ["specific food item 1", "specific food item 2"],
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>,
  "fiber": <number in grams>,
  "sugar": <number in grams>,
  "sodium": <number in milligrams>,
  "confidence": "<low|medium|high>",
  "notes": "<brief note about what you see and why you identified it this way>"
}

PORTION SIZE REFERENCE (with fiber/sugar/sodium):
- Glass of milk (250ml): 150 cal, 8g protein, 12g carbs, 8g fat, 0g fiber, 12g sugar, 120mg sodium
- Skyr (150g): 100 cal, 17g protein, 6g carbs, 0g fat, 0g fiber, 4g sugar, 50mg sodium
- Eggs (1 large): 70 cal, 6g protein, 0.5g carbs, 5g fat, 0g fiber, 0g sugar, 70mg sodium
- Oatmeal (40g dry): 150 cal, 5g protein, 27g carbs, 3g fat, 4g fiber, 1g sugar, 5mg sodium
- Banana (medium): 105 cal, 1g protein, 27g carbs, 0g fat, 3g fiber, 14g sugar, 1mg sodium
- Apple (medium): 95 cal, 0g protein, 25g carbs, 0g fat, 4g fiber, 19g sugar, 2mg sodium
- Chicken breast (100g): 165 cal, 31g protein, 0g carbs, 4g fat, 0g fiber, 0g sugar, 75mg sodium
- Rice (1 cup cooked): 205 cal, 4g protein, 45g carbs, 0g fat, 1g fiber, 0g sugar, 5mg sodium
- Bread (1 slice): 80 cal, 3g protein, 15g carbs, 1g fat, 1g fiber, 2g sugar, 150mg sodium

If you genuinely cannot identify the food, say so honestly and return low confidence with zeros.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this meal image and estimate the nutritional content. Return JSON only."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[User: ${user.id}] AI gateway error:`, response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.error(`[User: ${user.id}] Unexpected AI gateway error status:`, response.status, errorText);
      throw new Error("Analysis service temporarily unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log(`[User: ${user.id}] Raw AI response:`, content);

    // Parse the JSON response
    let nutritionData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error(`[User: ${user.id}] Failed to parse AI response:`, parseError);
      nutritionData = {
        foods: ["Unable to identify"],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        confidence: "low",
        notes: "Could not analyze the image. Please try with a clearer photo."
      };
    }

    console.log(`[User: ${user.id}] Parsed nutrition data:`, nutritionData);

    return new Response(
      JSON.stringify(nutritionData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error(`[${errorId}] Error in analyze-meal function:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Unable to analyze image. Please try again later.",
        errorId 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
