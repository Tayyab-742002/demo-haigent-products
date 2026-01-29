import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - pdf-parse-new doesn't have types
import pdfParse from "pdf-parse-new";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported for text extraction" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const data = await pdfParse(buffer);

    // Clean up the extracted text
    const cleanedText = data.text
      .replace(/\s+/g, " ") // Replace multiple whitespaces with single space
      .trim();

    return NextResponse.json({
      success: true,
      text: cleanedText,
      pages: data.numpages,
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
// import { NextRequest, NextResponse } from "next/server";

// // CommonJS import (REQUIRED)
// const pdfParse = require("pdf-parse-new");

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json(
//         { error: "No file provided" },
//         { status: 400 }
//       );
//     }

//     if (!file.type.includes("pdf")) {
//       return NextResponse.json(
//         { error: "Only PDF files are supported" },
//         { status: 400 }
//       );
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const data = await pdfParse(buffer);

//     const cleanedText = data.text.replace(/\s+/g, " ").trim();

//     return NextResponse.json({
//       success: true,
//       text: cleanedText,
//       pages: data.numpages,
//     });
//   } catch (error) {
//     console.error("PDF extraction error:", error);
//     return NextResponse.json(
//       { error: "Failed to extract text from PDF" },
//       { status: 500 }
//     );
//   }
// }


