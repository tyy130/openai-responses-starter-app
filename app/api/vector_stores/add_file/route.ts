import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  const { vectorStoreId, fileId, fileIds } = await request.json();
  const openai = getOpenAIClient();

  if (!openai) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
      { status: 500 }
    );
  }

  try {
    if (fileIds && Array.isArray(fileIds)) {
      const fileBatch = await openai.vectorStores.fileBatches.create(
        vectorStoreId,
        {
          file_ids: fileIds,
        }
      );
      return new Response(JSON.stringify(fileBatch), { status: 200 });
    } else {
      const vectorStoreFile = await openai.vectorStores.files.create(
        vectorStoreId,
        {
          file_id: fileId,
        }
      );
      return new Response(JSON.stringify(vectorStoreFile), { status: 200 });
    }
  } catch (error) {
    console.error("Error adding file(s):", error);
    return new Response("Error adding file(s)", { status: 500 });
  }
}
