import { db } from "../server/db";
import { mathActivities } from "../shared/schema";
import { storage } from "../server/storage";

async function main() {
  console.log("Deleting existing math activities...");
  await db.delete(mathActivities);
  console.log("Reseeding math activities...");
  await storage.seedMathActivities();
  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
