/**
 * CLI wrapper for phoneme clip generation.
 *
 * Usage:
 *   npm run generate:phonemes
 *   npm run generate:phonemes -- --force
 */
import { generatePhonemeClips } from "../server/phoneme-generator";

const force = process.argv.includes("--force");

async function main() {
  console.log(`Generating phoneme clips${force ? " (force)" : ""}…\n`);
  const result = await generatePhonemeClips({ force });
  console.log(`Backend: ${result.backend}`);
  console.log(`Output: ${result.outputDir}`);
  console.log(`Generated: ${result.generated.length}`);
  console.log(`Skipped: ${result.skipped.length}`);
  if (result.failed.length) {
    console.log(`Failed: ${result.failed.map((f) => f.sound).join(", ")}`);
    process.exit(1);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
