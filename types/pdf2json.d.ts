// types/pdf2json.d.ts
declare module "pdf2json" {
    class PDFParser {
      constructor();
      on(event: "pdfParser_dataError", callback: (errData: any) => void): void;
      on(event: "pdfParser_dataReady", callback: (pdfData: any) => void): void;
      parseBuffer(buffer: Buffer): void;
      getRawTextContent(): string;
    }
    export default PDFParser;
  }