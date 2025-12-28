import { getOpenAIClient } from "@/lib/openai";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vectorStoreId = searchParams.get("vector_store_id");
  const openai = getOpenAIClient();

  if (!openai) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
      { status: 500 }
    );
  }

  try {
    const vectorStoreFiles = await openai.vectorStores.files.list(
      vectorStoreId || ""
    );

    // Fetch details for each file to get the filename
    const filesWithDetails = await Promise.all(
      vectorStoreFiles.data.map(async (vsFile) => {
        try {
          const fileDetails = await openai.files.retrieve(vsFile.id);
          return {
            ...vsFile,
            filename: fileDetails.filename,
            size: fileDetails.bytes,
          };
        } catch {
          return {
            ...vsFile,
            filename: "Unknown File",
          };
        }
      })
    );

    return new Response(JSON.stringify({ data: filesWithDetails }), { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response("Error fetching files", { status: 500 });
  }
}
