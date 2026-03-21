import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 40,
    lineHeight: 1.4,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 16,
    borderBottom: "2pt solid #2563eb",
    paddingBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 4,
    borderBottom: "0.5pt solid #bfdbfe",
    paddingBottom: 2,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
  },
  paragraph: {
    fontSize: 9.5,
    marginBottom: 3,
  },
});

interface ResumePDFDocumentProps {
  content: string;
  name?: string;
}

export function ResumePDFDocument({
  content,
  name = "Resume",
}: ResumePDFDocumentProps) {
  const lines = content.split("\n").filter((l) => l.trim());

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.name }, name)
      ),
      React.createElement(
        View,
        { style: styles.section },
        ...lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
            return React.createElement(
              View,
              { key: idx, style: styles.bullet },
              React.createElement(Text, { style: styles.bulletDot }, "•"),
              React.createElement(
                Text,
                { style: styles.bulletText },
                trimmed.replace(/^[•\-]\s*/, "")
              )
            );
          }

          if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) {
            return React.createElement(
              Text,
              { key: idx, style: styles.sectionTitle },
              trimmed
            );
          }

          return React.createElement(
            Text,
            { key: idx, style: styles.paragraph },
            trimmed
          );
        })
      )
    )
  );
}

export async function generatePDFBuffer(
  content: string,
  name?: string
): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const doc = React.createElement(ResumePDFDocument, { content, name });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}
