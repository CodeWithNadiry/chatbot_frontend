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
    onSuccess: (data) => {
      queryClient.setQueryData(["documents"], (old = []) => [
        ...data.documents,
        ...old,
      ]);
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
        old.filter((d) => d.documentId !== id),
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
      <Header title="My Documents" btnText="Upload" onClick={openUploadModal} />

      <main className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        <Modal open={activeModal === "upload"} onClose={closeModal}>
          <div className="flex flex-col gap-6">
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
              className={`border rounded-xl p-8 flex flex-col items-center gap-4 ${
                isDragging ? "bg-blue-50 border-blue-300" : ""
              }`}
            >
              <Upload size={26} />

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
                <div className="w-full mt-4">
                  {files.map((file, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span>{file.name}</span>
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-semibold">Processing Settings</h2>

              {[
                {
                  name: "chunkOverlap",
                  label: "Chunk Overlap",
                  value: userInputs.chunkOverlap,
                  min: 0,
                  max: 150,
                },
                {
                  name: "chunkSize",
                  label: "Chunk Size",
                  value: userInputs.chunkSize,
                  min: 100,
                  max: 1000,
                },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>

                  <input
                    type="range"
                    name={item.name}
                    min={item.min}
                    max={item.max}
                    value={item.value}
                    onChange={handleUserInputs}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={activeModal === "delete"} onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold">Delete Document</h2>
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

        <div className="bg-white border rounded-xl">
          {isLoading ? (
            <p className="p-6">Loading...</p>
          ) : documents.length === 0 ? (
            <p className="p-6">No documents</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.documentId}
                className="flex justify-between p-4 border-b"
              >
                <div>{doc.fileName}</div>
                <button onClick={() => openDeleteModal(doc.documentId)}>
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;