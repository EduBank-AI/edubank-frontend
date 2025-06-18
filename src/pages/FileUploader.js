import { useState } from "react";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); // 'success', 'error', or ''
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Check if file already exists
      return !files.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
    });
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        status: 'pending' // 'pending', 'uploading', 'success', 'error'
      }))]);
      setMessage("");
      setUploadStatus("");
    } else if (newFiles.length > 0) {
      setMessage("Some files were already selected.");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setMessage("");
    setUploadStatus("");
  };

  const clearAllFiles = () => {
    setFiles([]);
    setMessage("");
    setUploadStatus("");
    setUploadProgress({});
  };

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

    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];
      
      // Update file status to uploading
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'uploading' } : f
      ));

      const formData = new FormData();
      formData.append("file", fileObj.file);

      try {
        // Simulate API call for demo purposes
        const response = await fetch("http://localhost:5000/load", {
          method: "POST",
          body: formData
        });
        
        if (response.ok) {
          // Update file status to success
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'success' } : f
          ));
          successCount++;
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error(`Error uploading file ${fileObj.file.name}:`, error);
        // Update file status to error
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'error' } : f
        ));
        errorCount++;
      }

      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsUploading(false);

    // Set final message based on results
    if (successCount === files.length) {
      setMessage(`All ${successCount} files uploaded successfully!`);
      setUploadStatus("success");
      
      // Simulate navigation after successful upload
      setTimeout(() => {
        alert("All files uploaded! Ready to proceed to Q&A system...");
      }, 1500);
    } else if (errorCount === files.length) {
      setMessage("All uploads failed. Please try again.");
      setUploadStatus("error");
    } else {
      setMessage(`${successCount} files uploaded successfully, ${errorCount} failed.`);
      setUploadStatus("partial");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Files</h2>
          <p className="text-gray-600">Select multiple files or drag and drop them to get started</p>
        </div>

        {/* File Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-6 ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : files.length > 0
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
          <p className="text-gray-600 mb-2">Drag and drop your files here</p>
          <p className="text-sm text-gray-400 mb-4">or</p>
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <span>Choose Files</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {files.length > 0 && (
            <p className="text-sm text-green-600 mt-3">
              {files.length} file(s) selected
            </p>
          )}
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="mb-6 space-y-3 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Selected Files</h3>
              <button
                onClick={clearAllFiles}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
                disabled={isUploading}
              >
                Clear All
              </button>
            </div>
            {files.map((fileObj) => (
              <div key={fileObj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-full ${
                    fileObj.status === 'success' ? 'bg-green-100' :
                    fileObj.status === 'error' ? 'bg-red-100' :
                    fileObj.status === 'uploading' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {fileObj.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : fileObj.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : fileObj.status === 'uploading' ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <File className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{fileObj.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileObj.file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-2"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
            files.length === 0 || isUploading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading {files.length} file(s)...</span>
            </div>
          ) : (
            `Upload ${files.length > 0 ? files.length : ''} File${files.length !== 1 ? 's' : ''}`
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-xl flex items-center space-x-3 ${
            uploadStatus === "success"
              ? "bg-green-50 border border-green-200"
              : uploadStatus === "error"
              ? "bg-red-50 border border-red-200"
              : uploadStatus === "partial"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-blue-50 border border-blue-200"
          }`}>
            {uploadStatus === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : uploadStatus === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : uploadStatus === "partial" ? (
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            )}
            <p className={`text-sm ${
              uploadStatus === "success"
                ? "text-green-700"
                : uploadStatus === "error"
                ? "text-red-700"
                : uploadStatus === "partial"
                ? "text-yellow-700"
                : "text-blue-700"
            }`}>
              {message}
            </p>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700 text-center">
              All files uploaded successfully! Ready to proceed to Q&A system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;