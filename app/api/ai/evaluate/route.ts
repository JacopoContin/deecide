import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface EvaluateRequest {
  userMessage: string;
  option: string;
  criterion: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, option, criterion } = await request.json() as EvaluateRequest;

    if (!userMessage || !option || !criterion) {
      return NextResponse.json(
        { error: "Missing required fields: userMessage, option, criterion" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a decision-making assistant that interprets natural language evaluations and converts them into a score describing how an option affects a criterion.

Score meanings:
-1 = Detrimental: the option works against this criterion
0 = Neutral: no real impact either way
1 = Positive: the option helps with this criterion
2 = Very positive: the option excels at this criterion

Analyze the user's response and determine an appropriate score. Also provide a brief reasoning (1-2 sentences) explaining why you assigned that score.

Return your response in JSON format with this structure:
{
  "score": number (-1, 0, 1 or 2),
  "reasoning": "Brief explanation"
}`;

    const userPrompt = `Option: "${option}"
Criterion: "${criterion}"
User's evaluation: "${userMessage}"

Based on the user's evaluation, what score (-1 to 2) best represents their assessment?`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("No response from AI");
    }

    const parsedResponse = JSON.parse(responseText);

    // Validate score is within range
    const rawScore = Number(parsedResponse.score);
    const score = Number.isFinite(rawScore) ? Math.max(-1, Math.min(2, Math.round(rawScore))) : 0;
    const reasoning = parsedResponse.reasoning || "Score assigned based on your evaluation.";

    return NextResponse.json({
      score,
      reasoning
    });
  } catch (error) {
    console.error("AI evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to parse evaluation" },
      { status: 500 }
    );
  }
}
