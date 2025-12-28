"use client";
import React, { useCallback, useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { FilePlus2, Plus, Trash2, CircleX } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface FileUploadProps {
  vectorStoreId?: string;
  vectorStoreName?: string;
  onAddStore: (id: string) => void;
  onUnlinkStore: () => void;
}

export default function FileUpload({
  vectorStoreId,
  onAddStore,
  onUnlinkStore,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [newStoreName, setNewStoreName] = useState<string>("Default store");
  const [uploading, setUploading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const acceptedFileTypes = {
    "text/x-c": [".c"],
    "text/x-c++": [".cpp"],
    "text/x-csharp": [".cs"],
    "text/css": [".css"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/x-golang": [".go"],
    "text/html": [".html"],
    "text/x-java": [".java"],
    "text/javascript": [".js"],
    "application/json": [".json"],
    "text/markdown": [".md"],
    "application/pdf": [".pdf"],
    "text/x-php": [".php"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      [".pptx"],
    "text/x-python": [".py"],
    "text/x-script.python": [".py"],
    "text/x-ruby": [".rb"],
    "application/x-sh": [".sh"],
    "text/x-tex": [".tex"],
    "application/typescript": [".ts"],
    "text/plain": [".txt"],
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles((prev) => {
        const newFiles = [...prev, ...acceptedFiles];
        if (newFiles.length > 10) {
          alert("You can only upload up to 10 files at a time.");
          return newFiles.slice(0, 10);
        }
        return newFiles;
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: acceptedFileTypes,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }
    setUploading(true);

    try {
      let finalVectorStoreId = vectorStoreId;

      // 1. If no vector store is linked, create one first
      if (!vectorStoreId || vectorStoreId === "") {
        const createResponse = await fetch("/api/vector_stores/create_store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newStoreName,
          }),
        });
        if (!createResponse.ok) {
          throw new Error("Error creating vector store");
        }
        const createData = await createResponse.json();
        finalVectorStoreId = createData.id;
        if (finalVectorStoreId) {
          onAddStore(finalVectorStoreId);
        }
      }

      if (!finalVectorStoreId) {
        throw new Error("Error getting vector store ID");
      }

      // 2. Upload all files first
      const fileIds: string[] = [];
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const base64Content = arrayBufferToBase64(arrayBuffer);
        const fileObject = {
          name: file.name,
          content: base64Content,
        };

        // Upload file
        const uploadResponse = await fetch("/api/vector_stores/upload_file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileObject,
          }),
        });
        if (!uploadResponse.ok) {
          throw new Error(`Error uploading file: ${file.name}`);
        }
        const uploadData = await uploadResponse.json();
        if (uploadData.id) {
          fileIds.push(uploadData.id);
        }
      }

      // 3. Add all files to vector store in one batch
      if (fileIds.length > 0) {
        const addFilesResponse = await fetch("/api/vector_stores/add_file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileIds,
            vectorStoreId: finalVectorStoreId,
          }),
        });
        if (!addFilesResponse.ok) {
          throw new Error(`Error adding files to vector store`);
        }
      }

      setFiles([]);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error during file upload process:", error);
      alert("There was an error processing your files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="bg-background rounded-full flex items-center justify-center py-1 px-3 border border-border gap-1 font-medium text-sm cursor-pointer hover:bg-muted transition-all">
          <Plus size={16} />
          Upload
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add files to your vector store</DialogTitle>
          </DialogHeader>
          <div className="my-6">
            {!vectorStoreId || vectorStoreId === "" ? (
              <div className="flex items-start gap-2 text-sm">
                <label className="font-medium w-72" htmlFor="storeName">
                  New vector store name
                  <div className="text-xs text-muted-foreground">
                    A new store will be created when you upload a file.
                  </div>
                </label>
                <Input
                  id="storeName"
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="border rounded p-2"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-sm font-medium w-24 text-nowrap">
                    Vector store
                  </div>
                  <div className="text-muted-foreground text-xs font-mono flex-1 text-ellipsis truncate">
                    {vectorStoreId}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CircleX
                          onClick={() => onUnlinkStore()}
                          size={16}
                          className="cursor-pointer text-muted-foreground mb-0.5 shrink-0 mt-0.5 hover:text-foreground transition-all"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Unlink vector store</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col mb-4 min-h-[200px]">
            {files.length > 0 ? (
              <div className="flex flex-col items-start w-full">
                <div className="text-muted-foreground mb-2">Loaded files ({files.length})</div>
                <div className="flex flex-col gap-2 w-full max-h-[150px] overflow-y-auto pr-2">
                  {files.map((f, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md w-full">
                      <div className="text-foreground text-sm truncate flex-1 mr-2">{f.name}</div>
                      <Trash2
                        onClick={() => removeFile(index)}
                        size={16}
                        className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      />
                    </div>
                  ))}
                </div>
                <div
                  {...getRootProps()}
                  className="mt-4 w-full p-4 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-all"
                >
                  <input {...getInputProps()} />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Plus size={16} />
                    Add more files
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div
                  {...getRootProps()}
                  className="p-6 flex items-center justify-center relative focus-visible:outline-0 w-full h-full"
                >
                  <input {...getInputProps()} />
                  <div
                    className={`absolute rounded-full transition-all duration-300 ${
                      isDragActive
                        ? "h-56 w-56 bg-muted"
                        : "h-0 w-0 bg-transparent"
                    }`}
                  ></div>
                  <div className="flex flex-col items-center text-center z-10 cursor-pointer">
                    <FilePlus2 className="mb-4 size-8 text-muted-foreground" />
                    <div className="text-muted-foreground">Upload files</div>
                    <div className="text-xs text-muted-foreground mt-1">Drag & drop or click to select</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
