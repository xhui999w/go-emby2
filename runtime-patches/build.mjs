import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {minify} from 'terser';

const directory = path.dirname(fileURLToPath(import.meta.url));
const [input, output] = process.argv.slice(2);
assert.ok(input && output, 'Usage: node build.mjs input-binary output-binary');
const binary = await readFile(input);
assert.equal(createHash('sha256').update(binary).digest('hex'), '538421f40eb93b8aa8a5e63587aea1224b6a337d70fc352d727c4dabbf4ee2d8', 'Unsupported upstream binary; review and pin its assets before updating');
assert.equal(binary.subarray(0, 4).toString('hex'), '7f454c46');
assert.equal(binary[4], 2);
assert.equal(binary[5], 1);
const headers = Number(binary.readBigUInt64LE(32));
const headerSize = binary.readUInt16LE(54), headerCount = binary.readUInt16LE(56);
const dataRanges = [];
for (let index = 0; index < headerCount; index++) {
  const offset = headers + index * headerSize;
  if (binary.readUInt32LE(offset) !== 1 || binary.readUInt32LE(offset + 4) & 1) continue;
  const start = Number(binary.readBigUInt64LE(offset + 8));
  dataRanges.push([start, start + Number(binary.readBigUInt64LE(offset + 32))]);
}
await mkdir(path.join(directory, 'dist'), {recursive: true});
for (const name of ['admin-directories.js', 'admin-libraries.js']) {
  const original = await readFile(path.join(directory, 'upstream', name));
  const modified = await readFile(path.join(directory, 'web', name), 'utf8');
  const result = await minify(modified, {mangle: {toplevel: false}, compress: true, format: {comments: false}});
  const replacement = Buffer.from(result.code + '\n');
  assert.ok(replacement.length <= original.length, `${name}: replacement exceeds embedded resource capacity`);
  const offset = binary.indexOf(original);
  assert.ok(offset >= 0 && binary.indexOf(original, offset + 1) === -1, `${name}: expected exactly one embedded asset`);
  assert.ok(dataRanges.some(([start, end]) => offset >= start && offset + original.length <= end), `${name}: asset must be entirely outside executable segments`);
  binary.fill(32, offset, offset + original.length);
  replacement.copy(binary, offset);
  await writeFile(path.join(directory, 'dist', name), replacement);
  console.log(`${name}: ${replacement.length}/${original.length} bytes`);
}
await writeFile(output, binary, {mode: 0o755});
console.log(`Patched asset data only; binary length remains ${binary.length}`);
