// UeiDo Edge Function: generate personalized workout + diet plan via Groq AI
// Set GROQ_API_KEY in Supabase Dashboard > Project Settings > Edge Functions > Secrets (or in .env for local supabase functions serve)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GROQ_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // or llama-3.1-8b-instant for faster

type ProfilePayload = {
  name?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  experience_level?: string; // beginner | intermediate | pro
  goal?: string; // lose | maintain | gain
  activity_level?: string;
  dietary_prefs?: Record<string, unknown>;
};

type PlanPayload = {
  profile: ProfilePayload;
  recent_logs?: { date: string; completed: boolean; workout_id?: string }[];
  regenerate?: boolean;
};

function buildSystemPrompt(): string {
  return `You are a certified fitness and nutrition coach for Indian users. Output ONLY valid JSON, no markdown or extra text.

Given a user profile (and optionally recent workout logs), produce a personalized plan in this exact structure:

{
  "workout_plan": {
    "split": "e.g. Push/Pull/Legs or Full Body",
    "days_per_week": number based on activity_level,
    "gym_week": [
      {
        "day_label": "Monday",
        "title": "e.g. Push Day — Chest, Shoulders, Triceps",
        "duration_min": 45-60,
        "difficulty": "beginner" | "intermediate" | "advanced",
        "exercises": [
          { "name": "Bench Press", "sets": "4", "reps": "8-10", "rest": "90s", "notes": "Barbell or dumbbell" }
        ]
      },
      ... 7 entries total (Monday through Sunday)
    ],
    "home_week": [
      {
        "day_label": "Monday",
        "title": "e.g. Full Body — Push Focus",
        "duration_min": 25-35,
        "difficulty": "beginner" | "intermediate" | "advanced",
        "exercises": [
          { "name": "Push-ups", "sets": "3", "reps": "12-15", "rest": "45s", "notes": "" }
        ]
      },
      ... 7 entries total (Monday through Sunday)
    ]
  },

WORKOUT RULES (CRITICAL):
- gym_week: EXACTLY 7 entries (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday). Each is a GYM workout using equipment (barbell, dumbbells, machines, cables). Include 5-7 exercises per day. Use splits like Push/Pull/Legs, Upper/Lower, or Full Body.
- home_week: EXACTLY 7 entries (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday). Each is a HOME workout using ONLY bodyweight (push-ups, squats, lunges, planks, burpees, mountain climbers, etc.). Include 5-8 exercises per day. No equipment.

ACTIVITY LEVEL → NUMBER OF WORKOUT DAYS (IMPORTANT - this is about how much exercise the person CURRENTLY does, so we recommend the opposite):
- sedentary (no exercise): Person doesn't exercise. They NEED 6-7 workout days per week to start a fitness routine. Light to moderate intensity.
- light (1-3 days/week): Person exercises a bit. Recommend 5-6 workout days to build consistency.
- moderate (3-5 days/week): Person is moderately active. Recommend 4-5 workout days.
- active (6-7 days/week): Person already exercises a lot. Recommend 3-4 workout days to avoid overtraining.
- very_active (athlete/physical job): Person is very active already. Recommend 2-3 workout days only, focus on recovery.

Days that are NOT workout days should be "Rest / Active Recovery" with title like "Rest Day — Light Stretch" and only 2-3 light exercises (stretching, walking, yoga).

PERSONALIZATION (USE ALL DATA):
- Calculate BMI from height/weight. If BMI > 30: focus on low-impact exercises. If BMI < 18.5: focus on strength building.
- Use age: younger (18-35) can handle higher intensity; older (50+) needs joint-friendly exercises.
- Use experience_level: beginner→simpler exercises/shorter duration/more rest, intermediate→standard, advanced→complex movements/supersets.
- Use goal: lose→more cardio/HIIT/circuit training, gain→more strength/compound lifts/progressive overload, maintain→balanced mix.
- NEVER use template exercises. Generate UNIQUE exercises personalized to this specific person's profile.
- Each exercise MUST have: name, sets (string like "3" or "4"), reps (string like "8-10" or "12"), rest (string like "90s" or "60s"), notes (string with form tips or modifications).
- Make gym_week and home_week DIFFERENT from each other. They are alternative plans for the same person.

  "diet_plan": {
    "daily_calories": number based on profile,
    "protein_g": number based on profile,
    "carbs_g": number based on profile,
    "fat_g": number based on profile,
    "weekly_days": [
      { "day_label": "Monday", "meals": [{ "name": "Breakfast", "time": "HH:MM", "pct_calories": number, "foods": ["your choice of Indian foods"] }, ... ] },
      ... one entry for each day Monday through Sunday
    ]
  },
  "calorie_targets": {
    "maintain": 2200,
    "target": 2000,
    "burn_target_per_day": 300,
    "deficit_or_surplus": -200
  }
}

Rules:
- DIET: NEVER use hardcoded or template diets. ALWAYS create a FRESH, personalized plan for THIS specific person. Use their age, weight, height, goal, activity level to calculate calories and macros. Each person gets a unique plan.
- Indian foods only: roti, chapati, rice, dal, sabzi, paneer, chicken, fish, poha, upma, idli, dosa, paratha, dahi, raita, chana, lassi, etc.
- For goal "lose": deficit 300-500 kcal, higher protein. For "gain": surplus 200-400 kcal. For "maintain": target = maintain.
- Never suggest fewer than 1200 kcal/day or more than 3500 for typical adults.
- weekly_days: exactly 7 entries (Monday–Sunday). Each day has 4-5 meals. Vary foods across days—no two days should be identical.
- Return only the JSON object.`;
}

function buildUserPrompt(profile: ProfilePayload, recentLogs: PlanPayload["recent_logs"], regenerate?: boolean): string {
  // Calculate BMI if height and weight are available
  let bmi: number | null = null;
  let bmiCategory = "N/A";
  if (profile.height_cm && profile.weight_kg) {
    const heightM = profile.height_cm / 100;
    bmi = Math.round((profile.weight_kg / (heightM * heightM)) * 10) / 10;
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";
  }

  const lines = [
    "USER PROFILE (use ALL this data to personalize the plan):",
    `- Name: ${profile.name ?? "N/A"}`,
    `- Age: ${profile.age ?? "N/A"} years old`,
    `- Gender: ${profile.gender ?? "N/A"}`,
    `- Height: ${profile.height_cm ?? "N/A"} cm`,
    `- Weight: ${profile.weight_kg ?? "N/A"} kg`,
    `- BMI: ${bmi ?? "N/A"} (${bmiCategory})`,
    `- Experience level: ${profile.experience_level ?? "N/A"}`,
    `- Goal: ${profile.goal ?? "N/A"}`,
    `- Current activity level: ${profile.activity_level ?? "N/A"} (this is how much they CURRENTLY exercise)`,
    `- Dietary preferences: ${JSON.stringify(profile.dietary_prefs ?? {})}`,
  ];

  if (recentLogs?.length) {
    lines.push(`\nRecent workout logs (last 7-14 days): ${JSON.stringify(recentLogs)}`);
  }

  lines.push("\n--- INSTRUCTIONS ---");
  lines.push("Generate a FRESH, 100% PERSONALIZED plan based on the profile above. DO NOT use templates.");
  lines.push("");
  lines.push("WORKOUT PLAN:");
  lines.push("- Create TWO separate 7-day plans: gym_week and home_week");
  lines.push("- Number of workout days depends on activity_level:");
  lines.push("  * sedentary → 6-7 workout days (they need to start exercising)");
  lines.push("  * light → 5-6 workout days");
  lines.push("  * moderate → 4-5 workout days");
  lines.push("  * active → 3-4 workout days (already active, avoid overtraining)");
  lines.push("  * very_active → 2-3 workout days only");
  lines.push("- Non-workout days = Rest Day with light stretching");
  lines.push("- Personalize exercises based on BMI, age, goal, and experience");
  lines.push("");
  lines.push("DIET PLAN:");
  lines.push("- Calculate calories based on BMI, age, gender, activity, and goal");
  lines.push("- 7 unique days with different Indian foods each day");

  if (regenerate) {
    lines.push("\n*** REGENERATION REQUEST ***");
    lines.push("User clicked REGENERATE. Create a COMPLETELY NEW and DIFFERENT plan:");
    lines.push("- Different exercises, different workout structure");
    lines.push("- Different foods, different meal times");
    lines.push("- DO NOT repeat anything from before. Surprise them with variety!");
  }

  return lines.join("\n");
}

function clampPlan(parsed: Record<string, unknown>): Record<string, unknown> {
  const diet = parsed.diet_plan as Record<string, unknown> | undefined;
  const cal = parsed.calorie_targets as Record<string, unknown> | undefined;
  if (diet && typeof diet.daily_calories === "number") {
    diet.daily_calories = Math.max(1200, Math.min(3500, diet.daily_calories));
  }
  if (cal) {
    if (typeof cal.target === "number") cal.target = Math.max(1200, Math.min(3500, cal.target));
    if (typeof cal.maintain === "number") cal.maintain = Math.max(1200, Math.min(3500, cal.maintain));
  }
  return parsed;
}

async function callGroq(apiKey: string, systemPrompt: string, userPrompt: string, regenerate?: boolean): Promise<string> {
  const temperature = regenerate ? 0.85 : 0.6; // Higher temp for regeneration = more variety
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: 8192,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from Groq");
  return content;
}

function extractJson(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}") + 1;
  if (start === -1 || end <= start) throw new Error("No JSON object in response");
  return JSON.parse(text.slice(start, end)) as Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY not set. Add it in Supabase Dashboard > Project Settings > Edge Functions > Secrets." }),
      { status: 500, headers: corsHeaders }
    );
  }

  let userId: string;
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.slice(7);
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.sub;
    if (!userId) throw new Error("No sub in JWT");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JWT" }), { status: 401, headers: corsHeaders });
  }

  let body: PlanPayload;
  try {
    body = (await req.json()) as PlanPayload;
    if (!body?.profile) throw new Error("Missing profile");
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid body: " + (e instanceof Error ? e.message : "unknown") }),
      { status: 400, headers: corsHeaders }
    );
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(body.profile, body.recent_logs, body.regenerate);

  let raw: string;
  try {
    raw = await callGroq(apiKey, systemPrompt, userPrompt, body.regenerate);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Groq call failed: " + (e instanceof Error ? e.message : "unknown") }),
      { status: 502, headers: corsHeaders }
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson(raw);
    parsed = clampPlan(parsed);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Failed to parse Groq response as JSON: " + (e instanceof Error ? e.message : "unknown"), raw: raw.slice(0, 500) }),
      { status: 502, headers: corsHeaders }
    );
  }

  const workout_plan = parsed.workout_plan ?? {};
  const diet_plan = parsed.diet_plan ?? {};
  const calorie_targets = parsed.calorie_targets ?? {};

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const planRes = await fetch(`${supabaseUrl}/rest/v1/plans?user_id=eq.${userId}`, {
    method: "GET",
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    },
  });
  const existing = (await planRes.json()) as { id?: string }[];
  const current_week = 1;

  if (existing.length > 0) {
    await fetch(`${supabaseUrl}/rest/v1/plans?id=eq.${existing[0].id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        current_week,
        workout_plan,
        diet_plan,
        calorie_targets,
        updated_at: new Date().toISOString(),
      }),
    });
  } else {
    await fetch(`${supabaseUrl}/rest/v1/plans`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        current_week,
        workout_plan,
        diet_plan,
        calorie_targets,
      }),
    });
  }

  return new Response(
    JSON.stringify({ ok: true, workout_plan, diet_plan, calorie_targets }),
    { headers: corsHeaders }
  );
});
