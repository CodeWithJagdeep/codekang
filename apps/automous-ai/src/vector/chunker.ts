import type { ParsedFile } from '../parser/analyzer';
import { extractSymbols } from '../parser/typescript';
import { countTokens } from '../parser/typescript';

// ─── Config ───────────────────────────────────────────────────────────────────

// Target chunk size: ~400 tokens (fits well in context + fast to embed)
const TARGET_CHUNK_TOKENS = 400;
// Maximum lines before we force-split a symbol chunk
const MAX_CHUNK_LINES = 80;
// Overlap lines when doing sliding-window splits inside a large symbol
const OVERLAP_LINES = 8;
// Minimum lines for a chunk to be worth indexing
const MIN_CHUNK_LINES = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawChunk {
  repoId: number;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  /** Context prefix injected for embedding quality (file path + symbol name). */
  embedText: string;
  language: string;
  tokenCount: number;
  chunkType: 'symbol' | 'window' | 'file-header';
  symbolName?: string;
}

// ─── Symbol boundary extraction ───────────────────────────────────────────────

interface SymbolSpan {
  name: string;
  startLine: number; // 1-indexed
  endLine: number; // 1-indexed, estimated
}

function extractSymbolSpans(content: string, extension: string): SymbolSpan[] {
  const symbols = extractSymbols(content, extension);
  if (symbols.length === 0) return [];

  const lines = content.split('\n');
  const spans: SymbolSpan[] = [];

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    const nextSym = symbols[i + 1];
    // End of this symbol = start of next symbol − 1, or EOF
    const endLine = nextSym ? nextSym.line - 1 : lines.length;
    if (endLine - sym.line < MIN_CHUNK_LINES) continue;
    spans.push({ name: sym.name, startLine: sym.line, endLine });
  }

  return spans;
}

// ─── Single-symbol chunker ────────────────────────────────────────────────────
// If a symbol is short enough, one chunk. If too long, sliding-window split
// but always keep the first line (the signature) as context.

function chunksFromSymbol(
  span: SymbolSpan,
  lines: string[],
  repoId: number,
  filePath: string,
  language: string,
): RawChunk[] {
  const symLines = lines.slice(span.startLine - 1, span.endLine);
  const signature = symLines[0] ?? '';

  if (symLines.length <= MAX_CHUNK_LINES) {
    const content = symLines.join('\n');
    return [
      makeChunk(
        repoId,
        filePath,
        span.startLine,
        span.endLine,
        content,
        language,
        'symbol',
        span.name,
      ),
    ];
  }

  // Too long — slide a window but prepend the signature to each sub-chunk
  const result: RawChunk[] = [];
  let start = 0;

  while (start < symLines.length) {
    const end = Math.min(start + MAX_CHUNK_LINES, symLines.length);
    // Always include the function signature as first line context
    const chunkLines =
      start === 0
        ? symLines.slice(0, end)
        : [signature, ...symLines.slice(start, end)];
    const content = chunkLines.join('\n');
    result.push(
      makeChunk(
        repoId,
        filePath,
        span.startLine + start,
        span.startLine + end - 1,
        content,
        language,
        'symbol',
        span.name,
      ),
    );
    const next = start + MAX_CHUNK_LINES - OVERLAP_LINES;
    if (next >= symLines.length) break;
    start = next;
  }

  return result;
}

// ─── Sliding-window fallback (for files without parseable symbols) ────────────

function chunksFromWindow(
  lines: string[],
  repoId: number,
  filePath: string,
  language: string,
): RawChunk[] {
  if (lines.length <= MAX_CHUNK_LINES) {
    const content = lines.join('\n');
    if (countTokens(content) < MIN_CHUNK_LINES) return [];
    return [
      makeChunk(repoId, filePath, 1, lines.length, content, language, 'window'),
    ];
  }

  const result: RawChunk[] = [];
  let start = 0;

  while (start < lines.length) {
    const end = Math.min(start + MAX_CHUNK_LINES, lines.length);
    const content = lines.slice(start, end).join('\n');
    result.push(
      makeChunk(repoId, filePath, start + 1, end, content, language, 'window'),
    );
    const next = start + MAX_CHUNK_LINES - OVERLAP_LINES;
    if (next >= lines.length) break;
    start = next;
  }

  return result;
}

// ─── File header chunk ────────────────────────────────────────────────────────
// A compact summary chunk: file path + list of all top-level symbol names.
// Helps surface the right file even when the exact symbol is deep.

function fileHeaderChunk(
  file: ParsedFile,
  repoId: number,
  spans: SymbolSpan[],
): RawChunk | null {
  const symbols = spans.map((s) => s.name);
  if (symbols.length === 0) return null;

  const content =
    `// File: ${file.relativePath}\n` +
    `// Symbols: ${symbols.join(', ')}\n\n` +
    file.content.split('\n').slice(0, 20).join('\n');

  return makeChunk(
    repoId,
    file.relativePath,
    1,
    Math.min(20, file.content.split('\n').length),
    content,
    file.language,
    'file-header',
  );
}

// ─── Public: chunk a single file ─────────────────────────────────────────────

export function chunkFile(file: ParsedFile, repoId: number): RawChunk[] {
  const lines = file.content.split('\n');
  const spans = extractSymbolSpans(file.content, file.extension);
  const result: RawChunk[] = [];

  if (spans.length > 0) {
    // 1. File-level header chunk for discoverability
    const header = fileHeaderChunk(file, repoId, spans);
    if (header) result.push(header);

    // 2. One chunk (or more if large) per symbol
    for (const span of spans) {
      result.push(
        ...chunksFromSymbol(
          span,
          lines,
          repoId,
          file.relativePath,
          file.language,
        ),
      );
    }

    // 3. Gap chunks: lines between symbols (imports, module-level code)
    let prevEnd = 0;
    for (const span of spans) {
      if (span.startLine - prevEnd > MIN_CHUNK_LINES) {
        const gapLines = lines.slice(prevEnd, span.startLine - 1);
        if (gapLines.join('').trim().length > 20) {
          result.push(
            ...chunksFromWindow(
              gapLines,
              repoId,
              file.relativePath,
              file.language,
            ).map((c) => ({ ...c, startLine: prevEnd + c.startLine })),
          );
        }
      }
      prevEnd = span.endLine;
    }
  } else {
    // No parseable symbols → sliding window
    result.push(
      ...chunksFromWindow(lines, repoId, file.relativePath, file.language),
    );
  }

  // Respect token budget — drop chunks that exceed it
  return result.filter(
    (c) =>
      c.tokenCount >= MIN_CHUNK_LINES &&
      c.tokenCount <= TARGET_CHUNK_TOKENS * 3,
  );
}

// ─── Public: chunk all files ──────────────────────────────────────────────────

export function chunkRepository(
  files: ParsedFile[],
  repoId: number,
): RawChunk[] {
  return files.flatMap((f) => chunkFile(f, repoId));
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeChunk(
  repoId: number,
  filePath: string,
  startLine: number,
  endLine: number,
  content: string,
  language: string,
  chunkType: RawChunk['chunkType'],
  symbolName?: string,
): RawChunk {
  // The embedText is richer than the raw content — includes path and symbol context.
  // This dramatically improves retrieval quality for code.
  const embedText =
    `File: ${filePath}` +
    (symbolName ? `\nSymbol: ${symbolName}` : '') +
    `\nLanguage: ${language}\n\n${content}`;

  return {
    repoId,
    filePath,
    startLine,
    endLine,
    content,
    embedText,
    language,
    tokenCount: countTokens(content),
    chunkType,
    symbolName,
  };
}
