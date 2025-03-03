import { createWorker } from "tesseract.js";

let resumeText = "";
if (resume) {
  const buffer = Buffer.from(await resume.arrayBuffer());
  const pdfParser = new PDFParser();
  resumeText = await new Promise((resolve, reject) => {
    pdfParser.on("pdfParser_dataError", (errData) => reject(errData));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    pdfParser.parseBuffer(buffer);
  });

  // If no text extracted, try OCR
  if (!resumeText.trim()) {
    console.log("No text extracted with pdf2json, attempting OCR...");
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(buffer);
    resumeText = data.text;
    await worker.terminate();
  }
}