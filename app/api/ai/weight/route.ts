import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { userMessage, criteria } = await request.json();

    if (!userMessage || !criteria || !Array.isArray(criteria)) {
      return NextResponse.json(
        { error: "Missing required fields: userMessage, criteria (array)" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a decision-making assistant that interprets natural language to assign importance weights to criteria.

The user will describe which criteria are more or less important to them. Based on their input, assign weights from 1-5 for each criterion:

1 = Not important
2 = Slightly important
3 = Moderately important
4 = Very important
5 = Extremely important

Return your response in JSON format with this structure:
{
  "weights": [
    {"criterionIndex": 0, "weight": number, "reasoning": "brief explanation"},
    {"criterionIndex": 1, "weight": number, "reasoning": "brief explanation"},
    ...
  ],
  "summary": "Brief overall explanation of the weighting"
}`;

    const criteriaList = criteria.map((c, i: number) => `${i}. ${c}`).join('\n');

    const userPrompt = `Criteria:\n${criteriaList}\n\nUser's preference: "${userMessage}"\n\nBased on what the user said, assign appropriate weights (1-5) to each criterion.`;

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

    interface WeightItem {
      criterionIndex: number;
      weight: number;
      reasoning?: string;
    }

    // Validate weights are within range
    const weights = parsedResponse.weights.map((w: WeightItem) => ({
      criterionIndex: w.criterionIndex,
      weight: Math.max(1, Math.min(5, w.weight || 3)),
      reasoning: w.reasoning || ""
    }));

    return NextResponse.json({
      weights,
      summary: parsedResponse.summary || "Weights assigned based on your preferences."
    });
  } catch (error) {
    console.error("AI weight parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse weight preferences" },
      { status: 500 }
    );
  }
}
