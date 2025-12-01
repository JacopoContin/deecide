import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export async function POST(request: NextRequest) {
  try {
    const { decisionTitle, options, criteria, scores, weights, winnerIndex } = await request.json();

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
    decisionSummary += `Options evaluated:\n${options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}\n\n`;
    decisionSummary += `Criteria used:\n${criteria.map((crit: string, i: number) => `${i + 1}. ${crit} (weight: ${weights.find((w: any) => w.criterionIndex === i)?.weight || 1})`).join('\n')}\n\n`;

    decisionSummary += `Scores:\n`;
    options.forEach((option: string, optIdx: number) => {
      decisionSummary += `\n${option}:\n`;
      criteria.forEach((criterion: string, critIdx: number) => {
        const score = scores.find((s: any) => s.optionIndex === optIdx && s.criterionIndex === critIdx)?.score || 0;
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const explanation = completion.choices[0].message.content;
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
