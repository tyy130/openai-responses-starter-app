import { execSync } from "child_process";

async function runMaintenance() {
  console.log("🛠️ Starting GenTel™ Auto-Maintenance...");

  try {
    // 1. Update DB Schema
    console.log("🔄 Syncing Database Schema...");
    execSync("npx drizzle-kit push", { stdio: "inherit" });
    console.log("✅ Schema sync complete.");

    // 2. Audit Dependencies
    console.log("🔍 Auditing dependencies...");
    try {
      execSync("npm audit fix", { stdio: "inherit" });
    } catch (e) {
      console.log("⚠️ Audit fix had some issues, but continuing...");
    }

    // 3. Build Check
    console.log("🏗️ Verifying build...");
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ Build verified.");

  } catch (error) {
    console.error("❌ Maintenance failed:", error);
    process.exit(1);
  }

  console.log("✨ Maintenance completed successfully.");
}

runMaintenance();
