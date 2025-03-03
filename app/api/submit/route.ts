// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const index = pinecone.Index("candidates");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const indexes = await pinecone.listIndexes();
    console.log("Available Pinecone indexes:", indexes);

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const linkedin = formData.get("linkedin") as string;
    const resume = formData.get("resume") as File | null;
    const skills = formData.get("skills") as string;
    const experience = formData.get("experience") as string;

    console.log("Form data received:", { name, email, linkedin, resume: resume ? resume.name : "No file", skills, experience });

    let resumeText = "";
    if (resume) {
      console.log("Processing resume file:", resume.name, "Size:", resume.size);
      const buffer = Buffer.from(await resume.arrayBuffer());
      const pdfParser = new PDFParser();
      resumeText = await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData) => {
          console.error("PDF parsing error:", errData);
          reject(errData);
        });
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          const text = pdfParser.getRawTextContent();
          console.log("Extracted resume text:", text);
          resolve(text);
        });
        pdfParser.parseBuffer(buffer);
      });
    } else {
      console.log("No resume file uploaded.");
    }

    const combinedText = `${resumeText} ${skills} ${experience}`;
    console.log("Combined text for Gemini:", combinedText);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const embeddingResult = await model.generateContent(`Generate a summary of: ${combinedText}`);
    const embeddingText = embeddingResult.response.text();
    console.log("Gemini summary:", embeddingText);

    const mockEmbedding = Array(384).fill(0).map((_, i) => i / 384);

    console.log("Upserting to Pinecone with email:", email);
    await index.upsert([
      {
        id: email,
        values: mockEmbedding,
        metadata: { name, email, linkedin, skills, experience, resumeText },
      },
    ]);

    return NextResponse.json({ message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Error in /api/submit:", error);
    return NextResponse.json({ message: "Internal server error", error: String(error) }, { status: 500 });
  }
}