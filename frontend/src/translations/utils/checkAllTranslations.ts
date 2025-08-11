import { t } from "../index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as globModule from "glob";
import chalk from "chalk";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../../");

// List of supported languages
const SUPPORTED_LANGUAGES = ["fi", "en"];

// Define interface for translation issues
interface TranslationIssue {
  path: string;
  issue: string;
  value?: unknown;
}

function checkObject(obj: unknown, pathArr: string[] = []): TranslationIssue[] {
  let issues: TranslationIssue[] = [];

  if (typeof obj !== "object" || obj === null) {
    issues.push({
      path: pathArr.join("."),
      issue: "Expected translation object, found string or non-object",
      value: obj,
    });
    return issues;
  }

  const keys = Object.keys(obj as Record<string, unknown>);
  const isTranslationObj =
    SUPPORTED_LANGUAGES.every((lang) => keys.includes(lang)) &&
    keys.length <= SUPPORTED_LANGUAGES.length;

  if (isTranslationObj) {
    for (const lang of SUPPORTED_LANGUAGES) {
      const typedObj = obj as Record<string, unknown>;
      if (
        !(lang in typedObj) ||
        typedObj[lang] === undefined ||
        typedObj[lang] === null ||
        typedObj[lang] === ""
      ) {
        issues.push({
          path: [...pathArr, lang].join("."),
          issue: `Missing translation for "${lang}"`,
        });
      }
    }
    return issues;
  }

  for (const key of keys) {
    issues = issues.concat(
      checkObject((obj as Record<string, unknown>)[key], [...pathArr, key]),
    );
  }
  return issues;
}

// --- Hardcoded string checker ---
function checkHardcodedStrings(strictMode = false) {
  const srcPath = path.join(ROOT_DIR, "src");

  // Log which directories and files are being checked
  console.log(`Scanning directory: ${srcPath}`);

  // Convert Windows backslashes to forward slashes for glob
  const normalizedPath = srcPath.replace(/\\/g, "/");

  // Use normalized path with explicit forward slashes in glob pattern
  const files = globModule.sync(`${normalizedPath}/**/*.{tsx,jsx}`, {
    ignore: [
      "**/translations/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/types/**",
      "**/*.d.ts",
    ],
    absolute: true,
  });

  console.log(`Found ${files.length} files to check`);

  // If files are found, return early to avoid manual glob
  if (files.length > 0) {
    return checkFilesForHardcodedStrings(files, strictMode);
  }

  // Fallback to manual approach
  console.warn(
    "No files found with standard glob pattern, trying alternative approach...",
  );

  // If no files were found, try a more direct approach
  if (files.length === 0) {
    console.warn(
      "No files found with standard glob pattern, trying alternative approach...",
    );

    // Try a different approach to find files, excluding .ts files
    const manualGlob: string[] = [];
    const scanDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (
          stat.isDirectory() &&
          !fullPath.includes("node_modules") &&
          !fullPath.includes("translations")
        ) {
          scanDir(fullPath);
        } else if (
          stat.isFile() &&
          /\.(tsx|jsx)$/.test(item) &&
          !item.endsWith(".d.ts") &&
          !fullPath.includes("translations")
        ) {
          manualGlob.push(fullPath);
        }
      }
    };

    try {
      scanDir(srcPath);
      console.log(`Found ${manualGlob.length} files using manual search`);
      if (manualGlob.length > 0) {
        return checkFilesForHardcodedStrings(manualGlob, strictMode);
      }
    } catch (err) {
      console.error("Error in manual glob:", err);
    }
  }

  return checkFilesForHardcodedStrings(files, strictMode);
}

// Extract file checking logic to a separate function
function checkFilesForHardcodedStrings(
  files: string[],
  strictMode: boolean = false,
) {
  // Use different patterns based on strictness
  const jsxContentRegex = strictMode
    ? />\s*([^<>{}\n]+?)\s*</g // strict
    : />\s*([\w\s.,!?;:'"()-]+?)\s*</g; // relaxed

  // Enhanced regex for property assignments with more keys in strict mode
  const propAssignmentRegex = strictMode
    ? /\b(header|title|label|placeholder|aria-label|alt|text|description|message|content|name|button|heading|tooltip|summary|value|className|style|aria-description)\s*:\s*["']([^"']+?)["']/g // strict
    : /\b(header|title|label|placeholder|aria-label|alt|text|description|message|content|name|button|heading|tooltip|summary|value)\s*:\s*["']([^"']+?)["']/g; // relaxed

  // Check more variable types in strict mode
  const stringAssignmentRegex = strictMode
    ? /\b(const|let|var|return)\s+\w+\s*=\s*["']([^"']+?)["']/g // strict
    : /\b(const|let|var)\s+\w+\s*=\s*["']([^"']+?)["']/g; // relaxed

  const issues = [];

  // Fewer ignore patterns in strict mode
  const ignorePatterns = strictMode
    ? [
        /^\/\//, // Comments
        /^\s*$/, // Empty strings
      ]
    : [
        /^\/\//, // Comments
        /^\s*$/, // Empty strings
        /^[a-z0-9_-]+$/, // Simple identifiers
        /^name:/, // Redux slice names
        /[)}]:[({]$/, // JSX expressions
        /^&/, // CSS selectors
        /^[=]/, // Type annotations
      ];

  // Enhanced patterns to ignore common false positives
  const falsePositivePatterns = [
    /^[A-Z][a-zA-Z]+$/, // PascalCase (likely component names)
    /^[a-z]+([A-Z][a-z]*)*$/, // camelCase (likely variable names)
    /value:\s*"(create|update|delete|edit|softDelete|restoreRole|hardDelete)"/, // CRUD operation values
    /\)\s*:\s*\w+\s*\?\s*\(/, // Ternary operator patterns
    /^\w+\.\w+\./, // Property access patterns like "row.original.is_active"
    /\w+\.toLowerCase\(\)/, // Method calls like toLowerCase()
    /\w+\.includes\(/, // Method calls like includes()
    /^\s*\)\s*[=:>]\s*/, // Function/method endings
  ];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");

      // Skip fewer file patterns in strict mode
      if (
        (!strictMode && file.includes("validations")) ||
        file.includes(".test.") ||
        file.includes(".d.ts")
      )
        continue;

      // Check for hardcoded JSX content
      let jsxMatch;
      jsxContentRegex.lastIndex = 0;

      while ((jsxMatch = jsxContentRegex.exec(content))) {
        const str = jsxMatch[1].trim();
        const lineNumber = content
          .substring(0, jsxMatch.index)
          .split("\n").length;

        // Lower threshold in strict mode
        const shouldReport = strictMode
          ? str && str.length > 0 // Much more aggressive, even single-character strings will be flagged
          : str && str.length > 2; // Relaxed, only reports hardcoded strings in JSX if they are longer than 2 characters

        // Less filtering in strict mode
        const punctuationRegex = strictMode
          ? /^[\s\d.,:;!?-]+$/ // Only basic punctuation excluded in strict mode
          : /^[\s\d.,:;!?@#$%^&*()+=\-€$%]+$/; // More comprehensive by default

        if (
          shouldReport &&
          (!strictMode || !str.includes("{")) && // In strict mode, may check template expressions
          !str.includes("t.") && // Not using translation system
          !punctuationRegex.test(str) &&
          !ignorePatterns.some((pattern) => pattern.test(str)) &&
          !falsePositivePatterns.some((pattern) => pattern.test(str)) && // Enhanced filtering
          !/\w+\.\w+\(/.test(str) && // Skip method calls
          !/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/.test(str) && // Skip function calls
          !/\)\s*[,;}\]]/.test(str) && // Skip function/method endings
          !/^\s*\w+\s*[(){}[\]]/.test(str) // Skip code expressions with brackets/parens
        ) {
          const relPath = path.relative(ROOT_DIR, file);
          issues.push({
            file: relPath,
            line: lineNumber,
            text: str,
            type: "jsx",
          });
        }
      }

      // Check property assignments with simpler filtering
      let propMatch;
      propAssignmentRegex.lastIndex = 0;

      while ((propMatch = propAssignmentRegex.exec(content))) {
        const propName = propMatch[1];
        const str = propMatch[2].trim();
        const lineNumber = content
          .substring(0, propMatch.index)
          .split("\n").length;

        // Enhanced filtering for property assignments
        if (
          str &&
          str.length > 1 &&
          !str.includes("t.") &&
          !falsePositivePatterns.some((pattern) =>
            pattern.test(`${propName}: "${str}"`),
          ) &&
          !/^(transition|hover|bg-|text-|border-|font-|p-|m-|w-|h-|flex|grid|rounded|shadow|space-|gap-|justify-|items-|absolute|relative|fixed|static|sticky|top-|bottom-|left-|right-|z-|opacity-|cursor-|select-|pointer-|overflow-|hidden|visible|block|inline|table-|sr-only|not-sr-only)/.test(
            str,
          ) // Skip Tailwind classes
        ) {
          const relPath = path.relative(ROOT_DIR, file);
          issues.push({
            file: relPath,
            line: lineNumber,
            text: str,
            propName: propName,
            type: "prop",
          });
        }
      }

      // Check string assignments in variables
      let stringMatch;
      stringAssignmentRegex.lastIndex = 0;

      while ((stringMatch = stringAssignmentRegex.exec(content))) {
        const varName = stringMatch[1];
        const str = stringMatch[2].trim();
        const lineNumber = content
          .substring(0, stringMatch.index)
          .split("\n").length;

        // Filter out common patterns that don't need translation
        if (
          str &&
          str.length > 2 &&
          !str.includes("t.") &&
          !/^[\s\d.,:;!?@#$%^&*()+=\-€$%]+$/.test(str) && // Not just symbols/punctuation
          !/^(https?:\/\/|www\.)/.test(str) && // Not a URL
          !/^[A-Z][a-zA-Z0-9]*$/.test(str) && // Not a component name
          !/\w+\.\w+\(/.test(str) && // Not method calls
          !/\)\s*[,;}\]]/.test(str) && // Not method/function endings
          !ignorePatterns.some((pattern) => pattern.test(str))
        ) {
          const relPath = path.relative(ROOT_DIR, file);
          issues.push({
            file: relPath,
            line: lineNumber,
            text: str,
            varName: varName,
            type: "string-var",
          });
        }
      }

      // Additional strict mode checks
      if (strictMode) {
        // Check for JSX attributes that might need translation
        const attrRegex =
          /\b(placeholder|title|alt|aria-label|data-tooltip)\s*=\s*["']([^"'{}]+?)["']/g;
        let attrMatch;

        while ((attrMatch = attrRegex.exec(content))) {
          const attrName = attrMatch[1];
          const str = attrMatch[2].trim();
          const lineNumber = content
            .substring(0, attrMatch.index)
            .split("\n").length;

          if (
            str &&
            str.length > 1 &&
            !str.includes("t.") &&
            !/^[\s\d.,:;!?-]+$/.test(str)
          ) {
            const relPath = path.relative(ROOT_DIR, file);
            issues.push({
              file: relPath,
              line: lineNumber,
              text: str,
              type: "jsx-attr",
              attrName,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return issues;
}

export function checkAllTranslations(strictMode = false) {
  console.log("Checking translations structure...");
  try {
    const issues = checkObject(t);
    if (issues.length === 0) {
      console.log(chalk.green("✅ All translations are present (in modules)."));
    } else {
      console.warn(
        chalk.red(
          `❌ Found ${issues.length} missing translations (in modules):`,
        ),
      );
      for (const issue of issues) {
        console.warn(
          `- ${chalk.blue(issue.path)}: ${chalk.yellow(issue.issue)}`,
        );
      }
    }

    console.log("\nChecking for hardcoded strings in components...");
    const hardcoded = checkHardcodedStrings(strictMode);
    if (hardcoded.length === 0) {
      console.log(chalk.green("✅ No hardcoded strings found."));
    } else {
      console.warn(
        chalk.red(
          `❌ Found ${hardcoded.length} potential hardcoded UI strings:`,
        ),
      );
      for (const issue of hardcoded) {
        if (issue.propName) {
          console.warn(
            `- ${chalk.blue(issue.file)}:${chalk.yellow(issue.line)} ${chalk.magenta(issue.propName)}: "${chalk.red(issue.text)}"`,
          );
        } else {
          console.warn(
            `- ${chalk.blue(issue.file)}:${chalk.yellow(issue.line)} "${chalk.red(issue.text)}"`,
          );
        }
      }
    }

    return { translationIssues: issues, hardcodedStrings: hardcoded };
  } catch (error: unknown) {
    console.error(chalk.red("Error checking translations:"), error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: String(error) };
  }
}
