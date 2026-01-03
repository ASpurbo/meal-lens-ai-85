import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { foodDescription } = await req.json();

    if (!foodDescription || typeof foodDescription !== "string") {
      return new Response(JSON.stringify({ error: "Food description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a precise nutrition calculator. Given a food description with specific quantities, calculate the exact nutritional content.

Return ONLY a valid JSON object with this exact structure:
{
  "foods": ["list", "of", "detected", "food", "items"],
  "calories": number (total calculated calories),
  "protein": number (grams of protein),
  "carbs": number (grams of carbohydrates),
  "fat": number (grams of fat),
  "confidence": "low" | "medium" | "high",
  "notes": "brief breakdown showing calculation per ingredient"
}

CRITICAL CALCULATION RULES:
1. Use EXACT gram amounts when specified by the user
2. Standard nutrition values per 100g:
   - Skyr/Greek yogurt: ~10g protein, 4g carbs, 0.2g fat, 60 kcal
   - Protein powder (whey): ~80g protein, 5g carbs, 3g fat per 100g
   - Oats: ~13g protein, 66g carbs, 7g fat, 380 kcal
   - Chicken breast: ~31g protein, 0g carbs, 3.6g fat
   - Rice (cooked): ~2.7g protein, 28g carbs, 0.3g fat
   - Eggs: ~13g protein, 1g carbs, 11g fat per 100g
   - Banana: ~1.1g protein, 23g carbs, 0.3g fat

3. Calculate proportionally: if user says "70g oats", calculate: 70g × (13g protein/100g) = 9.1g protein

4. For protein powder amounts like "28g protein powder" - this means 28 grams of the powder itself (roughly 22-24g actual protein)

5. Add up all ingredients precisely - do NOT round up or estimate higher

6. If no quantity specified, use standard serving sizes and note "low" confidence

Example calculation for "250g skyr with 28g protein powder and 70g oats":
- 250g skyr: 25g protein, 10g carbs, 0.5g fat
- 28g protein powder: ~22g protein, 1.4g carbs, 0.8g fat  
- 70g oats: 9g protein, 46g carbs, 4.9g fat
- TOTAL: ~56g protein, 57g carbs, 6.2g fat`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Estimate the nutrition for: ${foodDescription}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to estimate nutrition" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from response
    let nutritionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      return new Response(JSON.stringify({ error: "Failed to parse nutrition data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Estimation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
