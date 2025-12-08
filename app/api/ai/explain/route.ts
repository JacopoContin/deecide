import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Score {
  optionIndex: number;
  criterionIndex: number;
  score: number;
}

interface Weight {
  criterionIndex: number;
  weight: number;
}

interface ExplainRequest {
  decisionTitle: string;
  options: string[];
  criteria: string[];
  scores: Score[];
  weights: Weight[];
  winnerIndex: number;
}

export async function POST(request: NextRequest) {
  try {
    const { decisionTitle, options, criteria, scores, weights, winnerIndex } = await request.json() as ExplainRequest;

    if (!decisionTitle || !options || !criteria || !scores || !weights || winnerIndex === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build a structured summary of the decision
    const winner = options[winnerIndex];

    let decisionSummary = `Decision: ${decisionTitle}\n\n`;
    decisionSummary += `Winner: ${winner}\n\n`;
    decisionSummary += `Options evaluated:\n${options.map((opt, i: number) => `${i + 1}. ${opt}`).join('\n')}\n\n`;
    decisionSummary += `Criteria used:\n${criteria.map((crit, i: number) => `${i + 1}. ${crit} (weight: ${weights.find((w) => w.criterionIndex === i)?.weight || 1})`).join('\n')}\n\n`;

    decisionSummary += `Scores:\n`;
    options.forEach((option, optIdx: number) => {
      decisionSummary += `\n${option}:\n`;
      criteria.forEach((criterion, critIdx: number) => {
        const score = scores.find((s) => s.optionIndex === optIdx && s.criterionIndex === critIdx)?.score || 0;
        decisionSummary += `  - ${criterion}: ${score}/5\n`;
      });
    });

    const systemPrompt = `You are a thoughtful decision-making advisor. Given the results of a decision matrix, provide a clear, insightful explanation of:
1. Why the winner is the best choice based on the data
2. Key strengths and weaknesses of the winning option
3. Important considerations or potential concerns
4. A brief mention of the runner-up (if relevant)

Keep your explanation concise (2-3 paragraphs), balanced, and actionable. Focus on helping the user understand their decision better.`;

    const userPrompt = decisionSummary;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
      },
    });

    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    if (!explanation) {
      throw new Error("No response from AI");
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
