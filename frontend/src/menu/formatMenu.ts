import * as fs from "fs";

interface MenuItem {
  name: string;
  description: string;
  price: string;
  image: string;
}

interface MenuSection {
  name: string;
  items: MenuItem[];
}

function parseMenuFile(filePath: string): MenuSection[] {
  const lines = fs.readFileSync(filePath, "utf-8")
    .split("\n")
    .map(line => line.trim());
  const sections: MenuSection[] = [];

  let currentSection: MenuSection | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    //Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    //Detect section header
    if (
      !line.startsWith("$") &&
      (i === 0 || lines[i - 1] === "") && // start of file or blank line before
      (i + 1 < lines.length && !lines[i + 1].startsWith("$"))
    ) {
      if (currentSection) sections.push(currentSection);
      currentSection = { name: line, items: [] };
      i++;
      continue;
    }

    //Parse menu items
    if (currentSection) {
      const name = line;
      const next = lines[i + 1];
      const maybePrice = next?.startsWith("$") ? next : lines[i + 2];
      const description = next?.startsWith("$") ? "" : next || "";

      if (maybePrice && maybePrice.startsWith("$")) {
        currentSection.items.push({
          name,
          description,
          price: maybePrice,
          image: ""
        });
        i += description ? 3 : 2;
        continue;
      }
    }

    i++;
  }

  if (currentSection) sections.push(currentSection);

  return sections;
}

function generateTypeScriptFile(menu: MenuSection[], outputPath: string) {
  const tsContent =
    "export const menu = " + JSON.stringify(menu, null, 2) + " as const;\n";
  fs.writeFileSync(outputPath, tsContent, "utf-8");
  console.log(`Menu exported to ${outputPath}`);
}

//parser

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: npx ts-node formatMenu.ts <input.txt> <output.ts>");
  process.exit(1);
}

const [inputFile, outputFile] = args;

try {
  const menu = parseMenuFile(inputFile);
  generateTypeScriptFile(menu, outputFile);
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}
