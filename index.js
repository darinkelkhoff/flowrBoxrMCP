#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const COMMENT_CHARS = {
  "/": ["js", "ts", "jsx", "tsx", "java", "c", "cpp", "h", "hpp", "cs", "go", "rs", "swift", "kt", "kts", "scala", "groovy", "gradle", "json", "css", "scss", "less", "php"],
  "#": ["sh", "bash", "zsh", "py", "rb", "pl", "pm", "yaml", "yml", "toml", "tf", "hcl", "r", "jl", "coffee", "mk", "makefile", "dockerfile", "gitignore", "env", "vtl", "vm", "conf"],
  "-": ["sql", "lua", "hs", "elm", "ada"],
  ";": ["clj", "cljs", "el", "lisp", "scm", "asm"],
  "%": ["tex", "erl", "m"],
};

function getCommentChar(filename) {
  if (!filename) return "/";
  const ext = filename.split(".").pop().toLowerCase();
  const base = filename.split("/").pop().toLowerCase();

  if (base === "makefile" || base === "dockerfile") {
    return "#";
  }

  for (const [char, exts] of Object.entries(COMMENT_CHARS)) {
    if (exts.includes(ext)) return char;
  }
  return "/";
}

function createFlowerBoxComment(text, commentChar) {
  const lines = text.split("\n");
  let leastIndent = null;

  const replacementLines = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Strip away any leading or trailing comment chars
    const escapedChar = commentChar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    line = line.replace(new RegExp(`^( *)${escapedChar}+ *`), "$1");
    line = line.replace(new RegExp(` *${escapedChar}+ *$`), "");

    // Strip trailing spaces
    line = line.replace(/ *$/, "");

    const lineIsEmpty = line.trim().length === 0;

    // If line is empty and it's the first or last, skip it (previous header/footer)
    if (lineIsEmpty && (i === 0 || i === lines.length - 1)) {
      continue;
    }

    replacementLines.push(line);

    // Skip empty lines when computing indent
    if (lineIsEmpty) continue;

    // Find the indent of this line
    let lineIndent = 0;
    for (let c = 0; c < line.length; c++) {
      if (line.charAt(c) !== " ") {
        lineIndent = c;
        break;
      }
    }

    if (leastIndent === null || lineIndent < leastIndent) {
      leastIndent = lineIndent;
    }
  }

  if (leastIndent === null) leastIndent = 0;

  const indentString = " ".repeat(leastIndent);

  // Find the longest line
  let longestLength = 0;
  for (const line of replacementLines) {
    if (line.length > longestLength) {
      longestLength = line.length;
    }
  }

  // Build the top & bottom border
  const borderLength = longestLength + 6 - leastIndent;
  const topAndBottom = commentChar.repeat(Math.ceil(borderLength / commentChar.length)).substring(0, borderLength);

  // Build the output
  let result = indentString + topAndBottom + "\n";

  for (const line of replacementLines) {
    let replacementLine = indentString + commentChar + commentChar + " " + line.substring(Math.min(line.length, leastIndent));

    while (replacementLine.length < longestLength + 3) {
      replacementLine += " ";
    }

    replacementLine += " " + commentChar + commentChar;
    result += replacementLine + "\n";
  }

  result += indentString + topAndBottom;

  return result;
}

const server = new McpServer({
  name: "flowrBoxr",
  version: "1.0.0",
});

server.tool(
  "create_flower_box_comment",
  "Create a flower box comment - a decorative box made of comment characters surrounding text. " +
  "Use this for inline section dividers and block comments within code. " +
  "Do NOT use this for element-level documentation (classes, methods, fields, interfaces, enums) in Java or similar languages — " +
  "use full-width Javadoc headers for those (e.g., /***...***\\n * ...\\n ***...***/). " +
  "The comment character is auto-detected from the filename extension, or can be specified manually.",
  {
    text: z.string().describe("The text to put inside the flower box. Can be single or multi-line."),
    filename: z.string().optional().describe("Optional filename (or extension like '.py') to auto-detect the comment character."),
    comment_char: z.string().optional().describe("Optional explicit comment character to use (e.g., '/', '#', '-'). Overrides filename detection."),
    indent: z.number().optional().describe("Optional number of spaces to indent the entire box. If not provided, indentation is detected from the input text."),
  },
  async ({ text, filename, comment_char, indent }) => {
    let cc = comment_char || getCommentChar(filename);

    let inputText = text;
    if (indent !== undefined && indent > 0) {
      // Add indentation to each line if specified
      inputText = text
        .split("\n")
        .map((line) => " ".repeat(indent) + line)
        .join("\n");
    }

    const result = createFlowerBoxComment(inputText, cc);
    return { content: [{ type: "text", text: result }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
