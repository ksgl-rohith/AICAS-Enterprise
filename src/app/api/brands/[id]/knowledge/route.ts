import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const textContent = formData.get('textContent') as string | null;

    const brand = await db.brand.findUnique({
      where: { id: params.id },
      include: { knowledgeDocs: true },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    if (brand.knowledgeDocs.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 knowledge documents per brand reached.' },
        { status: 400 }
      );
    }

    let filename = 'Knowledge_Notes.md';
    let fileType = 'md';
    let extractedText = '';
    let fileSize = 0;

    if (file) {
      filename = file.name;
      fileSize = file.size;
      const ext = filename.split('.').pop()?.toLowerCase() || 'txt';
      fileType = ext;

      const buffer = Buffer.from(await file.arrayBuffer());

      if (ext === 'pdf') {
        try {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } catch (pdfErr) {
          extractedText = buffer.toString('utf-8');
        }
      } else {
        extractedText = buffer.toString('utf-8');
      }
    } else if (textContent) {
      filename = formData.get('filename')?.toString() || 'Brand_Guidelines.txt';
      extractedText = textContent;
      fileSize = Buffer.byteLength(textContent, 'utf-8');
      fileType = 'txt';
    } else {
      return NextResponse.json({ error: 'No file or text content provided.' }, { status: 400 });
    }

    // Clean whitespace
    extractedText = extractedText.replace(/\r\n/g, '\n').trim();

    if (!extractedText) {
      return NextResponse.json({ error: 'Failed to extract text content from document.' }, { status: 400 });
    }

    // Split into ~800 char chunks with 100 char overlap
    const chunkSize = 800;
    const overlap = 100;
    const chunks: string[] = [];

    let start = 0;
    while (start < extractedText.length) {
      const end = Math.min(start + chunkSize, extractedText.length);
      chunks.push(extractedText.slice(start, end));
      start += chunkSize - overlap;
    }

    // Create Document record
    const doc = await db.brandKnowledgeDocument.create({
      data: {
        brandId: brand.id,
        filename,
        fileType,
        fileSize,
        extractedText,
        charCount: extractedText.length,
        chunkCount: chunks.length,
        status: 'PROCESSED',
      },
    });

    // Create Chunks
    await db.knowledgeChunk.createMany({
      data: chunks.map((chunk, idx) => ({
        documentId: doc.id,
        brandId: brand.id,
        chunkIndex: idx,
        content: chunk,
        charCount: chunk.length,
      })),
    });

    // Audit Event
    await db.auditEvent.create({
      data: {
        userId: brand.userId,
        brandId: brand.id,
        action: 'DOCUMENT_UPLOADED',
        details: `Uploaded document "${filename}" (${chunks.length} RAG chunks).`,
        entityType: 'BrandKnowledgeDocument',
        entityId: doc.id,
      },
    });

    return NextResponse.json({
      success: true,
      document: doc,
      chunkCount: chunks.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
