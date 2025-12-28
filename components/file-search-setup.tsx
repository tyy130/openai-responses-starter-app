"use client";
import React, { useState } from "react";
import useToolsStore from "@/stores/useToolsStore";
import FileUpload from "@/components/file-upload";
import { Input } from "./ui/input";
import { CircleX, Trash2, Loader2 } from "lucide-react";
import { TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Tooltip } from "./ui/tooltip";
import { TooltipProvider } from "./ui/tooltip";

export default function FileSearchSetup() {
  const { vectorStore, setVectorStore } = useToolsStore();
  const [newStoreId, setNewStoreId] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const fetchFiles = async (storeId: string) => {
    if (!storeId) return;
    setLoadingFiles(true);
    try {
      const res = await fetch(
        `/api/vector_stores/list_files?vector_store_id=${storeId}`
      );
      const data = await res.json();
      if (data.data) {
        setFiles(data.data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!vectorStore?.id) return;
    setDeletingFileId(fileId);
    try {
      const res = await fetch("/api/vector_stores/delete_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vector_store_id: vectorStore.id,
          file_id: fileId,
        }),
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setDeletingFileId(null);
    }
  };

  React.useEffect(() => {
    if (vectorStore?.id) {
      fetchFiles(vectorStore.id);
    } else {
      setFiles([]);
    }
  }, [vectorStore?.id]);

  const unlinkStore = async () => {
    setVectorStore({
      id: "",
      name: "",
    });
  };

  const handleAddStore = async (storeId: string) => {
    if (storeId.trim()) {
      const newStore = await fetch(
        `/api/vector_stores/retrieve_store?vector_store_id=${storeId}`
      ).then((res) => res.json());
      if (newStore.id) {
        console.log("Retrieved store:", newStore);
        setVectorStore(newStore);
      } else {
        alert("Vector store not found");
      }
    }
  };

  return (
    <div>
      <div className="text-sm text-muted-foreground">
        Upload files to create a Core Knowledge Base, or link an existing vector
        store. The assistant will prioritize this source for internal answers.
      </div>
      <div className="flex items-center gap-2 mt-2 h-12">
        <div className="flex items-center gap-4 w-full">
          <div className="text-sm font-medium w-36">Vector store (Core KB)</div>
          {vectorStore?.id ? (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-xs font-mono flex-1 text-ellipsis truncate text-muted-foreground">
                  {vectorStore.id}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleX
                        onClick={() => unlinkStore()}
                        size={16}
                        className="cursor-pointer text-muted-foreground hover:text-destructive transition-all"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="mr-2">
                      <p>Unlink vector store</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="ID (vs_XXXX...)"
                value={newStoreId}
                onChange={(e) => setNewStoreId(e.target.value)}
                className="rounded text-sm bg-input border border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddStore(newStoreId);
                  }
                }}
              />
              <button
                className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90 transition"
                onClick={() => handleAddStore(newStoreId)}
              >
                Link
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex mt-4">
        <FileUpload
          vectorStoreId={vectorStore?.id ?? ""}
          vectorStoreName={vectorStore?.name ?? ""}
          onAddStore={(id) => handleAddStore(id)}
          onUnlinkStore={() => unlinkStore()}
        />
      </div>

      {vectorStore?.id && (
        <div className="mt-6">
          <div className="text-sm font-medium mb-2 flex items-center justify-between">
            <span>Files in Knowledge Base</span>
            {loadingFiles && <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>}
          </div>
          <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
            {files.length > 0 ? (
              <div className="max-h-[200px] overflow-y-auto">
                {files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-2 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm truncate font-medium">{file.filename || file.id}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "Unknown size"}
                        </span>
                        <span className="text-[10px] px-1 rounded bg-primary/10 text-primary border border-primary/20">
                          {file.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deletingFileId === file.id}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      {deletingFileId === file.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {loadingFiles ? "Fetching files..." : "No files in this vector store."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
