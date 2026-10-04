// PostToolUse hook: formats a file with Prettier right after Claude edits or writes it.
// Only touches files inside the project; Prettier itself skips paths in .prettierignore
// and file types it doesn't know. Always exits 0 so a formatting problem
// (e.g. a syntax error mid-edit) never blocks the edit.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;

try {
  const { tool_input: toolInput } = JSON.parse(input);
  const file = toolInput?.file_path;
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const prettier = join(projectDir, 'node_modules', '.bin', 'prettier');
  const rel = file ? relative(projectDir, file) : '';
  const insideProject = rel && !rel.startsWith('..') && !isAbsolute(rel);

  if (insideProject && existsSync(prettier)) {
    spawnSync(prettier, ['--write', '--ignore-unknown', file], {
      cwd: projectDir,
      stdio: 'ignore',
    });
  }
} catch {
  // Ignore malformed input; never fail the tool call.
}

process.exit(0);
