// UeiDo Edge Function: analyze meal photo via Groq Vision API
// Set GROQ_API_KEY in Supabase Dashboard > Project Settings > Edge Functions > Secrets

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const GROQ_BASE = "https://api.groq.com/openai/v1"
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

function buildSystemPrompt(): string {
    return [
        "You are a professional sports nutritionist and calorie estimator.",
        "Analyze the provided image.",
        "",
        "CRITICAL INSTRUCTION: IF THE IMAGE DOES NOT CONTAIN REAL FOOD OR A BEVERAGE THAT CONTAINS CALORIES,",
        "YOU MUST SET CALORIES AND ALL MACROS TO 0 AND foods TO AN EMPTY ARRAY.",
        "DO NOT GUESS MACROS FOR NON-FOOD ITEMS (e.g., a person, a computer, a barbell, a pen, a car, etc.).",
        "",
        "If it IS food, estimate the nutritional content as accurately as possible,",
        "assuming a standard portion size if the scale is not obvious.",
        "",
        "Output ONLY valid JSON matching this exact structure, with no markdown formatting:",
        "{",
        '  "foods": ["list", "of", "identified", "foods"],',
        '  "calories": number,',
        '  "protein_g": number,',
        '  "carbs_g": number,',
        '  "fat_g": number,',
        '  "fiber_g": number,',
        '  "description": "Short, friendly description of the meal (or state that no food was found)"',
        "}",
    ].join("\n")
}

Deno.serve(async (req: Request) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        "Content-Type": "application/json",
    }
    if (req.method === "OPTIONS")
        return new Response(null, { headers: corsHeaders })

    const apiKey = Deno.env.get("GROQ_API_KEY")
    if (!apiKey) {
        return new Response(
            JSON.stringify({ error: "GROQ_API_KEY not set." }),
            { status: 500, headers: corsHeaders }
        )
    }

    let base64Image = ""
    let mealType = "snack"
    let userId = ""

    try {
        const authHeader = req.headers.get("Authorization")
        if (!authHeader?.startsWith("Bearer "))
            throw new Error("Missing Auth header")
        const token = authHeader.split(" ")[1]
        const payload = JSON.parse(atob(token.split(".")[1]))
        userId = payload.sub
        if (!userId) throw new Error("No user ID")
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid Authorization" }),
            { status: 401, headers: corsHeaders }
        )
    }

    try {
        const body = await req.json()
        base64Image = body.image_base64
        mealType = body.meal_type || "snack"
        if (!base64Image) throw new Error("Missing image_base64")
    } catch (err) {
        return new Response(
            JSON.stringify({
                error: "Bad request: " + (err instanceof Error ? err.message : String(err)),
            }),
            { status: 400, headers: corsHeaders }
        )
    }

    try {
        const apiUrl = GROQ_BASE + "/chat/completions"
        const imageDataUrl = "data:image/jpeg;base64," + base64Image
        const userText = "Please analyze this " + mealType + " photo."

        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + apiKey,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: "system", content: buildSystemPrompt() },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: userText },
                            {
                                type: "image_url",
                                image_url: { url: imageDataUrl },
                            },
                        ],
                    },
                ],
                temperature: 0.1,
                max_tokens: 1024,
            }),
        })

        if (!res.ok) {
            const errTxt = await res.text()
            throw new Error("Groq API Error " + res.status + ": " + errTxt)
        }

        const data = await res.json()
        const content = data.choices?.[0]?.message?.content?.trim() || ""

        // Extract JSON block
        const jsonStart = content.indexOf("{")
        const jsonEnd = content.lastIndexOf("}") + 1
        if (jsonStart === -1 || jsonEnd <= jsonStart)
            throw new Error("No JSON returned from AI")

        const parsed = JSON.parse(content.substring(jsonStart, jsonEnd))

        // Log the meal to Supabase
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        const supabaseClient = createClient(supabaseUrl, supabaseKey)

        const logData = {
            user_id: userId,
            meal_type: mealType,
            foods: parsed.foods || [],
            calories: parsed.calories || 0,
            protein_g: parsed.protein_g || 0,
            carbs_g: parsed.carbs_g || 0,
            fat_g: parsed.fat_g || 0,
            fiber_g: parsed.fiber_g || 0,
            description: parsed.description || "",
        }

        const { error: dbError } = await supabaseClient
            .from("meal_logs")
            .insert(logData)

        if (dbError) {
            console.error("DB Insert Error", dbError)
        }

        return new Response(JSON.stringify(parsed), { headers: corsHeaders })
    } catch (err) {
        console.error("analyze-meal error:", err)
        return new Response(
            JSON.stringify({
                error: err instanceof Error ? err.message : String(err),
            }),
            { status: 500, headers: corsHeaders }
        )
    }
})
