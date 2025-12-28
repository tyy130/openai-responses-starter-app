import { getOpenAIClient } from "../lib/openai";
import { db } from "../lib/db";
import { sessions } from "../lib/db/schema";

async function runRescueCheck() {
  console.log("🚀 Starting GenTel™ Rescue Agent Check...");
  let healthy = true;

  // 1. Check Database
  try {
    console.log("📡 Checking Database connection...");
    const result = await db.select().from(sessions).limit(1);
    console.log("✅ Database is reachable. Sessions found:", result.length);
  } catch (error) {
    console.error("❌ Database Check Failed:", error);
    healthy = false;
  }

  // 2. Check OpenAI API
  try {
    console.log("🤖 Checking OpenAI API...");
    const openai = getOpenAIClient();
    if (!openai) throw new Error("OPENAI_API_KEY is missing");
    // Simple model list check
    await openai.models.list();
    console.log("✅ OpenAI API is reachable.");
  } catch (error) {
    console.error("❌ OpenAI Check Failed:", error);
    healthy = false;
  }

  // 3. Check Environment Variables
  const requiredEnv = [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "OAUTH_STATE_SECRET"
  ];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      console.error(`❌ Missing required environment variable: ${env}`);
      healthy = false;
    }
  }

  if (!healthy) {
    console.error("🚨 Rescue Agent detected system issues!");
    process.exit(1);
  }

  console.log("✨ All systems nominal. GenTel™ is up and running.");
}

runRescueCheck().catch((err) => {
  console.error("💥 Fatal error in Rescue Agent:", err);
  process.exit(1);
});
