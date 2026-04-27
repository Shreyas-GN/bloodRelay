import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VALID_URGENCY = ["IMMEDIATE", "TODAY", "SCHEDULED"];

const SYSTEM_PROMPT = `You are a medical emergency request parser for an Indian blood donation platform called PulseAid. 

Extract structured data from the user's free-text emergency blood request. 

Fields to extract:
- blood_group: one of A+, A-, B+, B-, AB+, AB-, O+, O- (or null if not mentioned)
- urgency_level: IMMEDIATE, TODAY, or SCHEDULED. Infer from context.
- hospital_name: the hospital facility name (or null)
- units: integer between 1 and 10 (default to 1)
- patient_name: the patient's name (or null)
- reason: a brief reason like "ICU surgery" (or null)

Rules:
- Return ONLY valid JSON. 
- Never hallucinate values.
- Do not include any explanation or markdown. Just the raw JSON.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY in .env.local" }, { status: 503 });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text.trim() },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "AI returned no data." }, { status: 500 });
    }

    const parsed = JSON.parse(raw);

    // Sanitize
    const data = {
      blood_group: VALID_BLOOD_GROUPS.includes(parsed.blood_group?.toUpperCase()) ? parsed.blood_group.toUpperCase() : null,
      urgency_level: VALID_URGENCY.includes(parsed.urgency_level?.toUpperCase()) ? parsed.urgency_level.toUpperCase() : "IMMEDIATE",
      hospital_name: parsed.hospital_name || null,
      units: Math.min(10, Math.max(1, parseInt(parsed.units) || 1)),
      patient_name: parsed.patient_name || null,
      reason: parsed.reason || null,
    };

    return NextResponse.json({ data });

  } catch (err: any) {
    console.error("[Groq Error]", err);
    return NextResponse.json({ 
      error: "AI service failed. Please check your GROQ_API_KEY.",
      details: err.message 
    }, { status: 500 });
  }
}
