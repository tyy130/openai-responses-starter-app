import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { vector_store_id, file_id } = await request.json();
    const openai = getOpenAIClient();

    if (!openai) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500 }
      );
    }

    if (!vector_store_id || !file_id) {
      return new Response(
        JSON.stringify({ error: "vector_store_id and file_id are required" }),
        { status: 400 }
      );
    }

    // Delete the file from the vector store
    await openai.vectorStores.files.del(vector_store_id, file_id);

    // Also delete the file from OpenAI storage to keep it clean
    try {
      await openai.files.del(file_id);
    } catch (e) {
      console.warn("Failed to delete file from OpenAI storage:", e);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error deleting file:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
