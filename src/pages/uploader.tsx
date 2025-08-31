"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Toaster } from "~/components/ui/sonner";
import { toast } from "sonner";

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
      formData.append("file", fileObj.file);

      try {
        const response = await fetch("/api/load", {
          method: "POST",
          body: formData,
        });

        let data: any;
        const text = await response.text();

        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
        <Card className="w-full max-w-sm bg-gray-800/65 rounded-2xl shadow-xl p-5 border border-white/10">
          <CardHeader className="text-center mb-8 justify-center align-middle">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-700 via-violet-600 to-fuchsia-600 rounded-full">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Upload File
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select multiple files or drag and drop them to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="px-3">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-700 ease-in-out mb-6 ${
                dragOver
                  ? "border-blue-400"
                  : files.length > 0
                  ? "border-green-300"
                  : "border-gray-300 hover:border-blue-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <p className="text-white mb-2">Drag and drop your files here</p>
              <p className="text-sm text-white mb-4">or</p>
              <label className="inline-flex items-center px-4 py-2 bg-gray-800/70 border-2 border-dashed border-white/30 text-white rounded-lg hover:bg-blue-500 hover:border-white/0 transition-all duration-500 cursor-pointer">
                <span>Choose Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden cursor-pointer"
                />
              </label>
              {files.length > 0 && (
                <p className="text-sm text-green-600 mt-3">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </CardContent>

          {files.length > 0 && (
            <CardContent>
              <div className="mb-6 space-y-3 max-h-60 overflow-y-auto bg-gray-900/40 rounded-2xl border border-white/10 p-5 scrollbar-thin scrollbar-webkit">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    Selected Files
                  </h3>
                  <Button
                    onClick={clearAllFiles}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors cursor-pointer bg-transparent hover:bg-transparent"
                    disabled={isUploading}
                  >
                    Clear All
                  </Button>
                </div>

                {files.map((fileObj) => (
                  <div
                    key={fileObj.id}
                    className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg border border-gray-200/10"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-full ${
                          fileObj.status === "success"
                            ? "bg-green-100"
                            : fileObj.status === "error"
                            ? "bg-red-100"
                            : fileObj.status === "uploading"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {fileObj.status === "success" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : fileObj.status === "error" ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : fileObj.status === "uploading" ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <File className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {fileObj.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeFile(fileObj.id)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-2 cursor-pointer bg-transparent size-6"
                      disabled={isUploading}
                      variant="secondary"
                      size="icon"
                    >
                      <X className="w-2 h-2 text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}

          {!isUploading && (
            <CardContent>
              <Button
                onClick={uploadStatus === "success" ? handleContinue : handleUpload}
                disabled={files.length === 0}
                className={`cursor-pointer w-full h-11 py-3 px-4 mb-5 rounded-xl font-semibold transition-all duration-200 ${
                  files.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : uploadStatus === "success"
                    ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
              >
                {uploadStatus === "success"
                  ? "Continue"
                  : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
              </Button>
            </CardContent>
          )}

          {isUploading && message && (
            <CardContent>
              <div className="mt-0 p-4 rounded-xl flex items-center space-x-3 bg-blue-50 border border-blue-200">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <p className="text-sm text-blue-700">{message}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Toaster richColors closeButton />
    </>
  );
};

export default FileUploader;
