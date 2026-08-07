import type { ResumeData } from "@/lib/resume";
import { contactLine, dateRange, splitLines, OPTIONAL_SECTIONS } from "@/lib/resume";

/** Uses the browser print pipeline so the PDF is pixel-identical to the preview. */
export function exportPdf() {
  if (typeof window === "undefined") return;
  window.print();
}

export async function exportDocx(title: string, data: ResumeData) {
  const {
    Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, TabStopPosition,
    BorderStyle, LevelFormat,
  } = await import("docx");

  const P = (children: unknown[], opts: Record<string, unknown> = {}) =>
    new Paragraph({ children: children as never, ...opts });

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 180, after: 60 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 23, font: "Times New Roman" })],
    });

  const tabs = [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }];
  const twoCol = (left: string, right: string, bold = false, italics = false) =>
    new Paragraph({
      tabStops: tabs,
      children: [
        new TextRun({ text: left, bold, italics, size: 21, font: "Times New Roman" }),
        new TextRun({ text: `\t${right ?? ""}`, italics, size: 20, font: "Times New Roman" }),
      ],
    });
  const body = (text: string) =>
    P([new TextRun({ text, size: 20, font: "Times New Roman" })]);
  const bullet = (text: string) =>
    new Paragraph({
      numbering: { reference: "res-bullets", level: 0 },
      children: [new TextRun({ text, size: 20, font: "Times New Roman" })],
    });

  const kids: unknown[] = [
    P([new TextRun({ text: data.personal.fullName || "Your Name", bold: false, size: 44, font: "Times New Roman" })], {
      alignment: AlignmentType.CENTER,
    }),
    P([new TextRun({ text: contactLine(data.personal), size: 19, font: "Times New Roman" })], {
      alignment: AlignmentType.CENTER,
    }),
  ];

  if (data.education.length) {
    kids.push(heading("Education"));
    for (const e of data.education) {
      kids.push(twoCol(e.university, e.location ?? "", true));
      kids.push(twoCol([e.degree, e.major].filter(Boolean).join(", "), dateRange(e.startDate, e.endDate), false, true));
      if (e.gpa || e.cgpa) kids.push(body([e.gpa && `GPA: ${e.gpa}`, e.cgpa && `CGPA: ${e.cgpa}`].filter(Boolean).join(" · ")));
      if (e.coursework) kids.push(body(`Coursework: ${e.coursework}`));
      if (e.activities) kids.push(body(`Activities: ${e.activities}`));
    }
  }

  if (data.experience.length) {
    kids.push(heading("Experience"));
    for (const x of data.experience) {
      kids.push(twoCol(x.role, dateRange(x.startDate, x.endDate), true));
      kids.push(twoCol(x.company, x.location, false, true));
      if (x.description) kids.push(body(x.description));
      for (const b of (x.bullets ?? []).flatMap(splitLines)) kids.push(bullet(b));
    }
  }

  if (data.projects.length) {
    kids.push(heading("Projects"));
    for (const pr of data.projects) {
      kids.push(twoCol(`${pr.name}${pr.technologies ? ` | ${pr.technologies}` : ""}`, dateRange(pr.startDate, pr.endDate), true));
      const links = [pr.github, pr.demo].filter(Boolean).join("  |  ");
      if (links) kids.push(body(links));
      if (pr.description) kids.push(body(pr.description));
      for (const b of (pr.bullets ?? []).flatMap(splitLines)) kids.push(bullet(b));
    }
  }

  if (data.skills.length) {
    kids.push(heading("Technical Skills"));
    for (const s of data.skills) {
      kids.push(
        P([
          new TextRun({ text: `${s.category}: `, bold: true, size: 20, font: "Times New Roman" }),
          new TextRun({ text: s.skills, size: 20, font: "Times New Roman" }),
        ]),
      );
    }
  }

  if (data.awards.length) {
    kids.push(heading("Awards"));
    for (const a of data.awards) {
      kids.push(twoCol(a.title, a.date, true));
      if (a.detail) kids.push(body(a.detail));
    }
  }

  for (const s of OPTIONAL_SECTIONS) {
    const sec = data.optional[s.key];
    if (!sec?.enabled || !sec.items.length) continue;
    kids.push(heading(s.label));
    for (const it of sec.items) {
      kids.push(twoCol(it.title, it.date, true));
      if (it.detail) kids.push(body(it.detail));
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "res-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 460, hanging: 260 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 720, right: 792, bottom: 720, left: 792 },
          },
        },
        children: kids as never,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(title || "resume").replace(/[^\w\-]+/g, "_")}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
