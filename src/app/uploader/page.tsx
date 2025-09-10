"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  X, 
  CloudUpload 
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

import NavBar from "~/components/NavBar";
import MouseFollow from "~/components/MouseFollow";

interface FileObject {
  file: File;
  id: number;
  status: "pending" | "uploading" | "success" | "error";
}

const FileUploader = () => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<"" | "success" | "error" | "partial">("");
  const [dragOver, setDragOver] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "") {
      router.push("/404");
    }
  }, [router]);

  // Toast messages
  useEffect(() => {
    if (!isUploading && message) {
      if (uploadStatus === "success") toast.success(message);
      else if (uploadStatus === "error") toast.error(message);
      else if (uploadStatus === "partial") toast.warning(message);
      else toast.info(message);
      setMessage("");
    }
  }, [message, uploadStatus, isUploading]);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (file) =>
        !files.some(
          (f) => f.file.name === file.name && f.file.size === file.size
        )
    );

    if (validFiles.length > 0) {
      setFiles((prev) => [
        ...prev,
        ...validFiles.map((file) => ({
          file,
          id: Date.now() + Math.random(),
          status: "pending" as const,
        })),
      ]);
      setMessage("");
      setUploadStatus("");
    } else if (newFiles.length > 0) {
      setMessage("Some files were already selected.");
      setUploadStatus("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (fileId: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const clearAllFiles = () => setFiles([]);

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one file first.");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setMessage(`Uploading ${files.length} file(s)...`);
    setUploadStatus("");

    let successCount = 0;
    let errorCount = 0;

    for (const fileObj of files) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, status: "uploading" } : f
        )
      );

      const formData = new FormData();
      formData.append("dataset", fileObj.file);

      const token = localStorage.getItem("token");

      try {
        const response = await fetch("/api/api/datasets/upload", {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        });

        let data: any;
        const text = await response.text();

        try {
          data = JSON.parse(text);
          console.log("Parsed JSON response:", data);
        } catch {
          data = { message: text };
          console.log("Non-JSON response:", data);
        }

        console.log("Raw response:", response);

        if (response.ok) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id ? { ...f, status: "success" } : f
            )
          );
          successCount++;
          console.log("Upload success:", data);
        } else {
          console.error("Backend error:", data);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id ? { ...f, status: "error" } : f
            )
          );
          errorCount++;
        }
      } catch (error) {
        console.error(`Error uploading file ${fileObj.file.name}:`, error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "error" } : f
          )
        );
        errorCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsUploading(false);

    if (successCount === files.length) setUploadStatus("success");
    else if (errorCount === files.length) setUploadStatus("error");
    else setUploadStatus("partial");

    setMessage(
      `${successCount} file(s) uploaded successfully, ${errorCount} failed.`
    );
  };

  const handleContinue = () => router.push("/qa");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
    <MouseFollow />
    <NavBar />
    
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
          {/* Minimalist header */}
          <CardHeader className="border-b border-gray-300 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                <CloudUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  File Upload
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Upload files to process with AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Tech-style drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                dragOver
                  ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/50"
                  : files.length > 0
                  ? "border-green-400 bg-green-50/30 dark:bg-green-950/30"
                  : "border-gray-300 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-800/30 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className={`p-3 rounded-full transition-colors ${
                  dragOver 
                    ? "bg-blue-100 dark:bg-blue-900/50" 
                    : files.length > 0
                    ? "bg-green-100 dark:bg-green-900/50"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  <Upload className={`w-8 h-8 ${
                    dragOver 
                      ? "text-blue-500" 
                      : files.length > 0
                      ? "text-green-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`} />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Drop files here to upload
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    or browse from your device
                  </p>
                  
                  <label className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      {files.length} file{files.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Files list with tech styling */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                    Files ({files.length})
                  </h3>
                  <Button
                    onClick={clearAllFiles}
                    disabled={isUploading}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 h-8 px-3"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {files.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        fileObj.status === "success"
                          ? "bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                          : fileObj.status === "error"
                          ? "bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                          : fileObj.status === "uploading"
                          ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                          : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-md ${
                          fileObj.status === "success"
                            ? "bg-green-100 dark:bg-green-900/50"
                            : fileObj.status === "error"
                            ? "bg-red-100 dark:bg-red-900/50"
                            : fileObj.status === "uploading"
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}>
                          {fileObj.status === "success" ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : fileObj.status === "error" ? (
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : fileObj.status === "uploading" ? (
                            <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <File className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {fileObj.file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(fileObj.file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeFile(fileObj.id)}
                        disabled={isUploading}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            {!isUploading && (
              <Button
                onClick={uploadStatus === "success" ? handleContinue : handleUpload}
                disabled={files.length === 0}
                className={`w-full h-11 font-medium transition-colors ${
                  files.length === 0
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : uploadStatus === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {uploadStatus === "success" ? "Continue →" : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
              </Button>
            )}

            {/* Upload status */}
            {isUploading && message && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent dark:border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default FileUploader;