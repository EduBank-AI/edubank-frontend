"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "") {
      router.push("/404"); // ⬅️ Redirect
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
      formData.append("file", fileObj.file);

      const token = localStorage.getItem("token");

      try {
        const response = await fetch("/api/load", {
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 ">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">
            Upload File
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
            Select multiple files or drag and drop them
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-300 mb-4 ${
              dragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                : files.length > 0
                ? "border-green-400 bg-green-50 dark:bg-green-900/50"
                : "border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500 dark:bg-gray-700"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <p className="mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm">
              Drag & drop your files here
            </p>
            <p className="text-xs mb-2 text-gray-500 dark:text-gray-400">or</p>
            <label className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 text-sm dark:border dark:brder-gray-500">
              Choose Files
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {files.length > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                {files.length} file(s) selected
              </p>
            )}
          </div>
        </CardContent>
          
        {files.length > 0 && (
          <CardContent className="px-0">
            <div className="mb-4 space-y-2 max-h-52 overflow-y-auto bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Selected Files
                </h3>
                <Button
                  onClick={clearAllFiles}
                  className="text-xs text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-full px-2 py-0.5 transition-colors duration-300 bg-transparent cursor-pointer"
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
        
              {files.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs shadow-[inset_0_0px_2px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_0px_6px_rgba(0,0,0,0.3)] transition-colors duration-300 ${
                    fileObj.status === "success"
                      ? "bg-green-50 border-green-400 dark:bg-green-900/50 dark:border-green-500"
                      : fileObj.status === "error"
                      ? "bg-red-50 border-red-400 dark:bg-red-900/50 dark:border-red-500"
                      : fileObj.status === "uploading"
                      ? "bg-blue-50 border-blue-400 dark:bg-blue-900/50 dark:border-blue-500"
                      : "bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div
                      className={`p-1 rounded-full transition-colors duration-300 ${
                        fileObj.status === "success"
                          ? "bg-green-100 dark:bg-green-700"
                          : fileObj.status === "error"
                          ? "bg-red-100 dark:bg-red-700"
                          : fileObj.status === "uploading"
                          ? "bg-blue-100 dark:bg-blue-700"
                          : "bg-gray-100 dark:bg-gray-600"
                      }`}
                    >
                      {fileObj.status === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-300" />
                      ) : fileObj.status === "error" ? (
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      ) : fileObj.status === "uploading" ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <File className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-gray-800 dark:text-gray-200 text-xs">
                        {fileObj.file.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-[10px]">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors ml-1 cursor-pointer size-5"
                    disabled={isUploading}
                    variant="secondary"
                    size="icon"
                  >
                    <X className="w-3 h-3 text-gray-400 dark:text-gray-300" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {!isUploading && (
          <CardContent className="px-0">
            <Button
              onClick={uploadStatus === "success" ? handleContinue : handleUpload}
              disabled={files.length === 0}
              className={`w-full h-11 cursor-pointer rounded-xl font-semibold text-sm transition-all duration-300 transform ${
                files.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : uploadStatus === "success"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {uploadStatus === "success"
                ? "Continue"
                : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
            </Button>
          </CardContent>
        )}

        {isUploading && message && (
          <CardContent className="px-0">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-800 border border-blue-300 dark:border-blue-700 shadow text-xs h-11">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-700 dark:text-blue-300 font-medium">{message}</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );

};

export default FileUploader;
