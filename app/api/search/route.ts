// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const index = pinecone.Index("candidates");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();
    if (!jobDescription) {
      return NextResponse.json({ message: "Job description is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const embeddingResult = await model.generateContent(`Summarize: ${jobDescription}`);
    const jobEmbedding = Array(384).fill(0).map((_, i) => i / 384); // Mock embedding

    const queryResponse = await index.query({
      vector: jobEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const candidates = await Promise.all(
      queryResponse.matches.map(async (match) => {
        const metadata = match.metadata as any;
        const evalPrompt = `
          Job Description: ${jobDescription}
          Candidate Resume: ${metadata.resumeText || "Not provided"}
          Skills: ${metadata.skills || "Not provided"}
          Experience: ${metadata.experience || "Not provided"}
          Provide a relevance score (0-100) and feedback on missing skills in this format:
          Score: [number]
          Feedback: [text]
        `;
        const evalResult = await model.generateContent(evalPrompt);
        const evalText = evalResult.response.text();
        const scoreMatch = evalText.match(/Score: (\d+)/);
        const feedbackMatch = evalText.match(/Feedback: (.+)/);

        return {
          name: metadata.name || "Unknown",
          email: metadata.email || "Unknown",
          linkedin: metadata.linkedin || "Not provided",
          score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
          feedback: feedbackMatch ? feedbackMatch[1] : "No feedback provided",
        };
      })
    );

    return NextResponse.json(candidates.sort((a, b) => b.score - a.score));
  } catch (error) {
    console.error("Error in /api/search:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}