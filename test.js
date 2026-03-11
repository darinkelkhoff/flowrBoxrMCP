// Quick test to verify algorithm matches the Java implementation

// Pull in the createFlowerBoxComment function by requiring the module internals
// We'll just copy it here for testing since the module starts an MCP server on require

function createFlowerBoxComment(text, commentChar) {
  const lines = text.split("\n");
  let leastIndent = null;

  const replacementLines = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    const escapedChar = commentChar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    line = line.replace(new RegExp(`^( *)${escapedChar}+ *`), "$1");
    line = line.replace(new RegExp(` *${escapedChar}+ *$`), "");

    line = line.replace(/ *$/, "");

    const lineIsEmpty = line.trim().length === 0;

    if (lineIsEmpty && (i === 0 || i === lines.length - 1)) {
      continue;
    }

    replacementLines.push(line);

    if (lineIsEmpty) continue;

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

  let longestLength = 0;
  for (const line of replacementLines) {
    if (line.length > longestLength) {
      longestLength = line.length;
    }
  }

  const borderLength = longestLength + 6 - leastIndent;
  const topAndBottom = commentChar.repeat(Math.ceil(borderLength / commentChar.length)).substring(0, borderLength);

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

let passed = 0;
let failed = 0;

function assertEquals(expected, actual, label) {
  if (expected === actual) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${label}`);
    console.error(`  Expected:\n${expected}`);
    console.error(`  Actual:\n${actual}`);
  }
}

// testGetReplacementTextSingleLine
let expected = "//////////\n// Test //\n//////////";
assertEquals(expected, createFlowerBoxComment("Test", "/"), "single: bare");
assertEquals(expected, createFlowerBoxComment("// Test", "/"), "single: prefixed");
assertEquals(expected, createFlowerBoxComment("// Test //", "/"), "single: boxed");
assertEquals(expected, createFlowerBoxComment("// Test   ", "/"), "single: trailing spaces");
assertEquals(expected, createFlowerBoxComment("// Test   //", "/"), "single: trailing slashes+spaces");
assertEquals(expected, createFlowerBoxComment("/ Test   //", "/"), "single: single leading slash");
assertEquals(expected, createFlowerBoxComment("///// Test", "/"), "single: many leading slashes");

// testGetReplacementTextSingleLineIndented
expected = "   //////////\n   // Test //\n   //////////";
assertEquals(expected, createFlowerBoxComment("   Test   ", "/"), "indented: bare");
assertEquals(expected, createFlowerBoxComment("   // Test   ", "/"), "indented: prefixed");
assertEquals(expected, createFlowerBoxComment("   // Test    //  ", "/"), "indented: boxed");
assertEquals(expected, createFlowerBoxComment("   / Test    /  ", "/"), "indented: single slashes");

// testGetReplacementTextMultiLine
expected = "/////////////\n// Test    //\n// In Here //\n/////////////";
assertEquals(expected, createFlowerBoxComment("Test\nIn Here", "/"), "multi: bare");
assertEquals(expected, createFlowerBoxComment("// Test\nIn Here", "/"), "multi: prefixed");
assertEquals(expected, createFlowerBoxComment("// Test\nIn Here       ", "/"), "multi: trailing spaces");
assertEquals(expected, createFlowerBoxComment("/////////////\n// Test    //\n// In Here //\n/////////////", "/"), "multi: already boxed");
assertEquals(expected, createFlowerBoxComment("/////////////\n// Test //\n// In Here //\n/////////////", "/"), "multi: already boxed different widths");
assertEquals(expected, createFlowerBoxComment("// Test //\n// In Here", "/"), "multi: prefixed+suffixed first");

expected = "////////////////\n// Test       //\n//    In Here //\n////////////////";
assertEquals(expected, createFlowerBoxComment("Test\n   In Here", "/"), "multi: preserved indent");

expected = "   /////////////\n   // Test    //\n   //         //\n   // In Here //\n   /////////////";
assertEquals(expected, createFlowerBoxComment("   Test\n\n   In Here", "/"), "multi: empty middle line");
assertEquals(expected, createFlowerBoxComment("   Test\n \n   In Here", "/"), "multi: space middle line");
assertEquals(expected, createFlowerBoxComment("   Test\n   \n   In Here", "/"), "multi: indented empty middle");
assertEquals(expected, createFlowerBoxComment("   Test\n      \n   In Here", "/"), "multi: over-indented empty middle");

// Test with # comment char
expected = "##########\n## Test ##\n##########";
assertEquals(expected, createFlowerBoxComment("Test", "#"), "hash: single");

expected = "## Test ##\n## More ##";
// Actually let's test what it really produces
let hashMulti = createFlowerBoxComment("Test\nMore", "#");
let hashExpected = "##########\n## Test ##\n## More ##\n##########";
assertEquals(hashExpected, hashMulti, "hash: multi");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
