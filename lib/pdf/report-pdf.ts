type PdfReportInput = {
  companyName: string;
  reportType: string;
  participant: string;
  date: string;
  staff: string;
  timeLabel: string;
  timeValue: string;
  content: string;
  signature?: string | null;
  timeCompleted?: string | null;
};

function escapePdfText(text: string) {
  return text
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function wrapLine(line: string, maxLength = 88) {
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!word) continue;
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildTextLines(input: PdfReportInput) {
  const header = [
    input.companyName,
    input.reportType.toUpperCase(),
    `Participant: ${input.participant}`,
    `Date: ${input.date}`,
    `Staff: ${input.staff}`,
    `${input.timeLabel}: ${input.timeValue}`,
    ""
  ];
  const footer = [
    "",
    `Signature: ${input.signature || "Not recorded"}`,
    `Time completed: ${input.timeCompleted || "Not recorded"}`
  ];

  return [...header, ...input.content.split(/\r?\n/), ...footer].flatMap((line) =>
    wrapLine(line)
  );
}

function chunkLines(lines: string[], pageSize = 42) {
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += pageSize) {
    pages.push(lines.slice(index, index + pageSize));
  }
  return pages.length ? pages : [[]];
}

export function createReportPdf(input: PdfReportInput) {
  const pages = chunkLines(buildTextLines(input));
  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = 3 + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObjectNumber} 0 R >>`
    );

    const streamLines = pageLines.map((line, lineIndex) => {
      const y = 742 - lineIndex * 16;
      const font = lineIndex < 2 && pageIndex === 0 ? "F2" : "F1";
      const size = lineIndex < 2 && pageIndex === 0 ? 14 : 10;
      return `BT /${font} ${size} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    });
    const stream = streamLines.join("\n");
    objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  });

  const parts = ["%PDF-1.4\n"];
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(parts.join("")));
    parts.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = Buffer.byteLength(parts.join(""));
  parts.push(`xref\n0 ${objects.length + 1}\n`);
  parts.push("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    parts.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  parts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return Buffer.from(parts.join(""), "utf-8");
}

export function pdfResponse(pdf: Buffer, filename: string) {
  const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`
    }
  });
}
