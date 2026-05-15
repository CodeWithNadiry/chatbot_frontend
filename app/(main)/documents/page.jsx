"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";

import Button from "../../../components/Button";
import Header from "../../../components/Header";
import Modal from "../../../components/Modal";

import { useModalStore } from "../../../store/useModalStore";
import { useAuthStore } from "../../../store/useAuthStore";

const API = "https://chatbotbackend-production-dc6c.up.railway.app";

const DocumentsPage = () => {
  const { token } = useAuthStore();
  const filesRef = useRef();
  const queryClient = useQueryClient();
  const { activeModal, openModal, closeModal } = useModalStore();

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const [userInputs, setUserInputs] = useState({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await fetch(`${API}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      return data.documents || [];
    },
    enabled: !!token,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      formData.append("chunkSize", userInputs.chunkSize);
      formData.append("chunkOverlap", userInputs.chunkOverlap);

      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${API}/documents/upload`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Upload failed");

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      closeModal();
      setFiles([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId) => {
      const res = await fetch(`${API}/documents/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      return documentId;
    },

    onSuccess: (id) => {
      queryClient.setQueryData(["documents"], (old = []) =>
        old.filter((d) => d.documentId !== id)
      );

      closeModal();
      setSelectedDocumentId(null);
    },
  });

  function handleUpload() {
    uploadMutation.mutate();
  }

  function handleDelete() {
    deleteMutation.mutate(selectedDocumentId);
  }

  function handleUserInputs(e) {
    const { name, value } = e.target;
    setUserInputs((prev) => ({ ...prev, [name]: Number(value) }));
  }

  function handleBrowseFiles() {
    filesRef.current?.click();
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }

  function handleFileSelect(e) {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    filesRef.current.value = "";
  }

  function openUploadModal() {
    setFiles([]);
    openModal("upload");
  }

  function openDeleteModal(id) {
    setSelectedDocumentId(id);
    openModal("delete");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Header
        title="My Documents"
        btnText="Upload"
        onClick={openUploadModal}
      />

      <main className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* UPLOAD MODAL */}
        <Modal open={activeModal === "upload"} onClose={closeModal}>
          <div className="flex flex-col gap-6">

            {/* DROP AREA */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
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

            {/* SETTINGS */}
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
                      <p className="text-[#2D5BE3] font-medium">
                        {item.value}
                      </p>
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

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>

              <Button
                onClick={handleUpload}
                disabled={!files.length || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* DELETE MODAL */}
        <Modal open={activeModal === "delete"} onClose={closeModal}>
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Document
            </h2>

            <p className="text-sm text-gray-500">
              Are you sure you want to delete this document?
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>

              <Button onClick={handleDelete}>
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* DOCUMENT LIST */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-900">
            Uploaded Files
          </h2>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-gray-500">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No documents uploaded yet
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.documentId}
                  className="flex justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="text-sm">{doc.fileName}</div>

                  <button onClick={() => openDeleteModal(doc.documentId)}>
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;