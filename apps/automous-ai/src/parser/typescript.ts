// ─── Lightweight symbol extraction (regex-based, no AST dep) ─────────────────

export interface CodeSymbol {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'variable';
  line: number;
  signature: string;
}

const TS_PATTERNS: Array<{
  regex: RegExp;
  type: CodeSymbol['type'];
}> = [
  {
    regex: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm,
    type: 'function',
  },
  { regex: /^(?:export\s+)?class\s+(\w+)/gm, type: 'class' },
  { regex: /^(?:export\s+)?interface\s+(\w+)/gm, type: 'interface' },
  { regex: /^(?:export\s+)?type\s+(\w+)\s*=/gm, type: 'type' },
  {
    regex: /^(?:export\s+)?const\s+(\w+)\s*(?::\s*\S+\s*)?=/gm,
    type: 'variable',
  },
];

const TS_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'mts',
  'cts',
]);

export function extractSymbols(
  content: string,
  extension: string,
): CodeSymbol[] {
  if (!TS_EXTENSIONS.has(extension)) return [];

  const lines = content.split('\n');
  const symbols: CodeSymbol[] = [];

  for (const { regex, type } of TS_PATTERNS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const name = match[1]?.trim();
      if (!name) continue;
      const lineNum = content.slice(0, match.index).split('\n').length;
      symbols.push({
        name,
        type,
        line: lineNum,
        signature: (lines[lineNum - 1] ?? '').trim(),
      });
    }
  }

  return symbols;
}

// Rough token count: ~4 chars per token (GPT/Claude tokenizer average)
export function countTokens(content: string): number {
  return Math.ceil(content.length / 4);
}
