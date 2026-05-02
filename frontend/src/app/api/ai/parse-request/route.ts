import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VALID_URGENCY = ["IMMEDIATE", "TODAY", "SCHEDULED"];

const SYSTEM_PROMPT = `You are a medical emergency request parser for an Indian blood donation platform called BloodReach. 

Extract structured data from the user's free-text emergency blood request. 

Fields to extract:
- blood_group: one of A+, A-, B+, B-, AB+, AB-, O+, O- (or null if not mentioned)
- urgency_level: IMMEDIATE, TODAY, or SCHEDULED. Infer from context (words like "urgent", "critical", "immediately" = IMMEDIATE; "today" = TODAY; "next week" = SCHEDULED).
- hospital_name: the hospital facility name (or null)
- city: city name from the text, default to "Bangalore" if not mentioned
- units: integer between 1 and 10 (default to 1)
- patient_name: the patient's name (or null)
- requester_name: the person making the request (e.g. "Dr. Hegde", "Sarah Smith") - look for "My name is...", "This is [name]", "I am [name]" (or null)
- relation: the relationship of the requester to the patient (e.g. "Self", "Father", "Sister", "Friend", "Doctor") (or null)
- reason: a brief reason like "ICU surgery", "C-section", "accident" (or null)
- confidence: object with confidence score 0-1 for each field that was extracted
- missing_fields: array of field names that were not found and are critical (e.g. ["blood_group", "hospital_name"])

Rules:
- Return ONLY valid JSON.
- Never hallucinate values.
- If blood_group is ambiguous (e.g. "B positive"), normalize it to "B+".
- Do not include any explanation or markdown. Just the raw JSON.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: "Please describe your blood requirement in more detail." }, { status: 400 });
    }

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
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "AI returned no data." }, { status: 500 });
    }

    const parsed = JSON.parse(raw);

    // Sanitize and normalize
    const data = {
      blood_group: VALID_BLOOD_GROUPS.includes(parsed.blood_group?.toUpperCase()) ? parsed.blood_group.toUpperCase() : null,
      urgency_level: VALID_URGENCY.includes(parsed.urgency_level?.toUpperCase()) ? parsed.urgency_level.toUpperCase() : "IMMEDIATE",
      hospital_name: parsed.hospital_name || null,
      city: parsed.city || "Bangalore",
      units: Math.min(10, Math.max(1, parseInt(parsed.units) || 1)),
      patient_name: parsed.patient_name || null,
      requester_name: parsed.requester_name || null,
      relation: parsed.relation || "Unspecified",
      reason: parsed.reason || null,
      confidence: parsed.confidence || {},
      missing_fields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields : [],
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
