"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";

import Header from "../../../components/Header";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";

import { useAuthStore } from "../../../store/useAuthStore";
import { useModalStore } from "../../../store/useModalStore";
import { documentAPI } from "../../../lib/schemas/api/document.api";

const DocumentsPage = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const filesRef = useRef(null);

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
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: documentAPI.upload,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["documents"] });

      const previousDocuments = queryClient.getQueryData(["documents"]) || [];

      const optimisticDocs = files.map((file) => ({
        documentId: crypto.randomUUID(),
        fileName: file.name,
        fileType: file.type,
        status: "uploading",
        createdAt: new Date().toISOString(),
        optimistic: true,
      }));

      queryClient.setQueryData(
        ["documents"],
        [...optimisticDocs, ...previousDocuments],
      );

      return { previousDocuments };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["documents"], context?.previousDocuments || []);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });

      closeModal();
      setFiles([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"], exact: true });
      setSelectedId(null);
      closeModal();
    },
  });

  function handleUpload() {
    const formData = new FormData();

    formData.append("chunkSize", settings.chunkSize);
    formData.append("chunkOverlap", settings.chunkOverlap);

    files.forEach((file) => formData.append("files", file));

    uploadMutation.mutate(formData);
    closeModal();
  }

  function handleDelete() {
    if (!selectedId) return;
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
        onClick={() => {
          setFiles([]);
          openModal("upload");
        }}
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
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                setFiles((prev) => [
                  ...prev,
                  ...Array.from(e.dataTransfer.files), // e.dataTransfer.files → new files the user dropped into the drag area.
                  // Array.from(...) → converts the FileList into a normal array.
                ]);
              }}
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
                ref={filesRef}
                type="file"
                multiple
                hidden
                onChange={(e) =>
                  setFiles((prev) => [
                    ...prev,
                    ...Array.from(e.target.files || []),
                  ])
                }
              />

              <Button
                variant="secondary"
                onClick={() => filesRef.current?.click()}
              >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "chunkSize",
                  label: "Chunk Size",
                  min: 100,
                  max: 1000,
                  desc: "More context per chunk",
                },
                {
                  name: "chunkOverlap",
                  label: "Chunk Overlap",
                  min: 0,
                  max: 150,
                  desc: "Better continuity",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 min-w-75"
                >
                  <div className="flex justify-between text-sm">
                    <p>{item.label}</p>
                    <p className="text-[#2D5BE3] font-medium">
                      {settings[item.name]}
                    </p>
                  </div>

                  <input
                    type="range"
                    name={item.name}
                    min={item.min}
                    max={item.max}
                    value={settings[item.name]}
                    onChange={handleInput}
                    className="w-full"
                  />

                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>

              <Button
                onClick={handleUpload}
                disabled={!files.length || uploadMutation.isPending}
                className={!files.length || uploadMutation.isPending ? 'bg-gray-600 cursor-not-allowed': null}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* DELETE MODAL */}
        <Modal open={activeModal === "delete"} onClose={closeModal}>
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold">Delete Document</h2>
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

        {/* DOCUMENT LIST (NEW UI) */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-10 text-gray-500 text-center">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <Upload className="text-blue-600" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                No documents yet
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm">
                Upload your first document to start processing and searching
                content
              </p>

              <Button onClick={() => openModal("upload")}>
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => {
                const fileName = doc.fileName;
                const cleanName = fileName.replace(/^\d+-/, "");
                return (
                  <div
                    key={doc.documentId}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group"
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                        {doc.fileType?.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 truncate max-w-62.5">
                          {cleanName}
                        </span>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {doc.fileType}
                          </span>

                          <span className="w-1 h-1 bg-gray-300 rounded-full" />

                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              doc.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : doc.status === "processing"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : doc.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : doc.status === "uploading"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {doc.createdAt
                          ? new Date(doc.createdAt).toLocaleDateString()
                          : ""}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedId(doc.documentId);
                          openModal("delete");
                        }}
                        className="p-2 cursor-pointer rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;
