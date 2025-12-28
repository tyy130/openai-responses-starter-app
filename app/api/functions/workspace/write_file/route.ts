import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { path: filePath, content } = await request.json();
    const fullPath = path.join(process.cwd(), filePath);
    
    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(process.cwd())) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
