/**
 * CLI wrapper for phoneme clip generation.
 *
 * Usage:
 *   npm run generate:phonemes
 *   npm run generate:phonemes -- --force
 *   npm run generate:phonemes -- --force-human
 */
import { generateHumanCorePhonemeClips, generatePhonemeClips } from "../server/phoneme-generator";

const force = process.argv.includes("--force");
const forceHuman = process.argv.includes("--force-human");

async function main() {
  if (forceHuman && !force) {
    console.log("Generating human core phoneme clips…\n");
    const human = await generateHumanCorePhonemeClips({ force: true });
    console.log(`Output: ${human.outputDir}`);
    console.log(`Generated: ${human.generated.length}`);
    console.log(`Skipped: ${human.skipped.length}`);
    if (human.failed.length) {
      console.log(`Failed: ${human.failed.map((f) => f.sound).join(", ")}`);
      process.exit(1);
    }
    console.log("\nDone.");
    return;
  }

  console.log(`Generating phoneme clips${force ? " (force)" : ""}…\n`);
  const result = await generatePhonemeClips({ force, forceHuman });
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
