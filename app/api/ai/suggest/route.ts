import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { decisionTitle, type } = await request.json();

    if (!decisionTitle) {
      return NextResponse.json(
        { error: "Decision title is required" },
        { status: 400 }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "options") {
      systemPrompt = `You are a helpful decision-making assistant. Given a decision the user needs to make, suggest 3-5 relevant and practical options they should consider. Be specific and contextual to their situation. Return ONLY a JSON array of strings, nothing else.`;
      userPrompt = `Decision: "${decisionTitle}"\n\nProvide 3-5 specific options to consider. Return format: ["option1", "option2", "option3"]`;
    } else if (type === "criteria") {
      systemPrompt = `You are a helpful decision-making assistant. Given a decision the user needs to make, suggest 3-5 important criteria they should evaluate their options against. Be specific and relevant. Return ONLY a JSON array of strings, nothing else.`;
      userPrompt = `Decision: "${decisionTitle}"\n\nProvide 3-5 evaluation criteria. Return format: ["criterion1", "criterion2", "criterion3"]`;
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'options' or 'criteria'" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);

    // Extract the array - handle different possible response formats
    let suggestions: string[] = [];
    if (Array.isArray(parsedResponse)) {
      suggestions = parsedResponse;
    } else if (parsedResponse.options && Array.isArray(parsedResponse.options)) {
      suggestions = parsedResponse.options;
    } else if (parsedResponse.criteria && Array.isArray(parsedResponse.criteria)) {
      suggestions = parsedResponse.criteria;
    } else if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
      suggestions = parsedResponse.suggestions;
    } else {
      // Try to find the first array in the response
      const firstArray = Object.values(parsedResponse).find(val => Array.isArray(val));
      if (firstArray && Array.isArray(firstArray)) {
        suggestions = firstArray;
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
