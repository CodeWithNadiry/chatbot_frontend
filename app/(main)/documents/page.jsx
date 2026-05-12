/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import Header from "../../../components/Header";
import { Upload, X } from "lucide-react";
import Modal from "../../../components/Modal";
import { useModalStore } from "../../../store/useModalStore";
import { useAuthStore } from "../../../store/useAuthStore";

const DocumentsPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const { token } = useAuthStore();

  const filesRef = useRef();

  const { activeModal, openModal, closeModal } = useModalStore();

  const [userInputs, setUserInputs] = useState({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  function handleUserInputs(e) {
    const { name, value } = e.target;

    setUserInputs((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  }

  function handleBrowseFiles() {
    filesRef.current?.click();
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();

    setIsDragging(false);

    const dropped = Array.from(e.dataTransfer.files);

    setFiles(dropped);
  }

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files);

    setFiles(selected);
  }

  function resetFiles() {
    setFiles([]);
    setIsDragging(false);

    if (filesRef.current) {
      filesRef.current.value = "";
    }
  }

  function openUploadModal() {
    resetFiles();
    openModal("upload");
  }

  function closeUploadModal() {
    resetFiles();
    closeModal();
  }

  function openDeleteModal(documentId) {
    setSelectedDocumentId(documentId);
    openModal("delete");
  }

  function closeDeleteModal() {
    setSelectedDocumentId(null);
    closeModal();
  }

  async function getDocs() {
    try {
      const res = await fetch("http://localhost:5000cuments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await res.json();

      setDocuments(data.documents || []);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getDocs();
  }, [token]);

  async function handleUpload() {
    if (!files.length) return;

    const formData = new FormData();

    formData.append("chunkSize", userInputs.chunkSize);
    formData.append("chunkOverlap", userInputs.chunkOverlap);

    for (let file of files) {
      formData.append("files", file);
    }

    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:5000/documents/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      closeUploadModal();

      setDocuments((prev) => [...data.documents, ...prev]);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${selectedDocumentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((prev) =>
        prev.filter((doc) => doc.documentId !== selectedDocumentId),
      );

      closeDeleteModal();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Header title="My Documents" btnText="Upload" onClick={openUploadModal} />

      <main className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        <Modal open={activeModal === "upload"} onClose={closeUploadModal}>
          <div className="flex flex-col gap-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-4 text-center transition ${
                isDragging ? "bg-blue-50 border-blue-300" : ""
              }`}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#E8EDFB] text-[#2D5BE3]">
                <Upload size={26} />
              </div>

              <h2 className="text-base font-semibold text-gray-900">
                Drag & drop your files
              </h2>

              <p className="text-sm text-gray-500">or click below to upload</p>

              <input
                type="file"
                multiple
                className="hidden"
                ref={filesRef}
                onChange={handleFileSelect}
              />

              <Button variant="secondary" onClick={handleBrowseFiles}>
                Browse Files
              </Button>

              <p className="text-xs text-gray-400">Supports PDF, DOCX, TXT</p>

              {files.length > 0 && (
                <div className="w-full mt-4 bg-white border border-gray-200 rounded-lg p-3 text-left">
                  <p className="text-sm font-semibold mb-2">Selected Files</p>

                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-xs text-gray-600"
                    >
                      <span className="truncate">{file.name}</span>

                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">
                Processing Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "chunkOverlap",
                    label: "Chunk Overlap",
                    value: userInputs.chunkOverlap,
                    min: 0,
                    max: 150,
                    desc: "Shared tokens between chunks for better continuity",
                  },
                  {
                    name: "chunkSize",
                    label: "Chunk Size",
                    value: userInputs.chunkSize,
                    min: 100,
                    max: 1000,
                    desc: "Amount of text per chunk (larger = more context)",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3"
                  >
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-700">{item.label}</p>

                      <p className="text-[#2D5BE3] font-medium">{item.value}</p>
                    </div>

                    <input
                      type="range"
                      name={item.name}
                      min={item.min}
                      max={item.max}
                      value={item.value}
                      onChange={handleUserInputs}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-[#2D5BE3]"
                    />

                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeUploadModal}>
                Cancel
              </Button>

              <Button
                onClick={handleUpload}
                className={!files.length ? "opacity-50 cursor-not-allowed" : ""}
                disabled={!files.length || isLoading}
              >
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={activeModal === "delete"} onClose={closeDeleteModal}>
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Document
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this document?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeDeleteModal}>
                Cancel
              </Button>

              <Button onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </Modal>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-900">
            Uploaded Files
          </h2>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {documents.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#E8EDFB] text-[#2D5BE3]">
                  <Upload size={26} />
                </div>

                <h3 className="text-base font-semibold text-gray-900">
                  No documents uploaded yet
                </h3>

                <p className="text-sm text-gray-500 max-w-md">
                  Upload your first document to start processing and organizing
                  your files.
                </p>

                <Button onClick={openUploadModal}>Upload Document</Button>
              </div>
            ) : (
              <>
                <div className="hidden sm:grid grid-cols-[1fr_200px_60px] px-6 py-3 text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                  <p className="text-[16px]">File</p>
                  <p className="text-[16px]">Uploaded</p>
                  <p className="text-right text-[16px]">Action</p>
                </div>

                {documents.map((doc) => (
                  <div
                    key={doc.documentId}
                    className="flex sm:grid sm:grid-cols-[1fr_200px_60px] items-center px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-9 h-9 flex items-center justify-center rounded-md text-xs font-semibold shrink-0
                        ${
                          doc.fileType === "pdf"
                            ? "bg-red-100 text-red-600"
                            : doc.fileType === "docx"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {doc.fileType}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <p className="text-sm text-gray-800 truncate">
                          {doc.fileName}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:block text-sm text-gray-600">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => openDeleteModal(doc.documentId)}
                        className="w-9 h-9 cursor-pointer flex items-center justify-center rounded-md border border-gray-200 hover:bg-red-50 hover:border-red-200 transition"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;
