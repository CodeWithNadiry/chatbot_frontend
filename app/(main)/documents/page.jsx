"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";

import Header from "../../../components/Header";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";

import { useAuthStore } from "../../../store/useAuthStore";
import { useModalStore } from "../../../store/useModalStore";

import { documentAPI } from "../../../lib/api/document.api";

const DocumentsPage = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const filesRef = useRef();

  const { activeModal, openModal, closeModal } = useModalStore();

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [settings, setSettings] = useState({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: documentAPI.getAll,
    enabled: !!token,
  });

  const uploadMutation = useMutation({
    mutationFn: documentAPI.upload,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      closeModal();
      setFiles([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentAPI.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  function handleUpload() {
    const formData = new FormData();

    formData.append("chunkSize", settings.chunkSize);
    formData.append("chunkOverlap", settings.chunkOverlap);

    files.forEach((file) => formData.append("files", file));

    uploadMutation.mutate(formData);
  }

  function handleDelete() {
    deleteMutation.mutate(selectedId);
  }

  function handleInput(e) {
    const { name, value } = e.target;
    setSettings((p) => ({ ...p, [name]: Number(value) }));
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Header
        title="My Documents"
        btnText="Upload"
        onClick={() => openModal("upload")}
      />

      <main className="max-w-5xl mx-auto w-full px-4 py-6">
        {/* UPLOAD MODAL */}
        <Modal open={activeModal === "upload"} onClose={closeModal}>
          <div className="flex flex-col gap-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setFiles([...files, ...Array.from(e.dataTransfer.files)]);
              }}
              className={`border p-6 rounded-xl ${isDragging ? "bg-blue-50" : ""}`}
            >
              <Upload />
              <input
                ref={filesRef}
                type="file"
                multiple
                hidden
                onChange={(e) =>
                  setFiles([...files, ...Array.from(e.target.files)])
                }
              />

              <Button onClick={() => filesRef.current.click()}>Browse</Button>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                Upload
              </Button>
            </div>
          </div>
        </Modal>

        {/* DELETE MODAL */}
        <Modal open={activeModal === "delete"} onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <p>Delete document?</p>

            <div className="flex justify-end gap-3">
              <Button onClick={closeModal}>Cancel</Button>
              <Button onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </Modal>

        {/* LIST */}
        <div className="bg-white border rounded-xl mt-6">
          {isLoading ? (
            <div className="p-6">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="p-6">No documents</div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.documentId}
                className="flex justify-between p-4 border-b"
              >
                <span>{doc.fileName}</span>

                <button
                  onClick={() => {
                    setSelectedId(doc.documentId);
                    openModal("delete");
                  }}
                >
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
