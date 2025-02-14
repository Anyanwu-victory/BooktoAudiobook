"use client";

//import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/lib/mongodb";

export enum StatusText {
  UPLOADING = "File is Uploading...",
  UPLOADED = "File Uploaded Successfully",
  SAVING = "Saving file to database",
  GENERATING = "Generating AI Embeddings, This will only take a few seconds ...",
}

export type Status = StatusText[keyof StatusText];

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  const { user } = useUser();

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    const fileIdToUploadTo = uuidv4();
    setStatus(StatusText.UPLOADING);

    // Step 1: Upload the file to your storage solution (e.g., AWS S3, Cloudinary)
    const downloadURL = await uploadFileToStorage(file, fileIdToUploadTo);

    // Step 2: Save file metadata to MongoDB
    setStatus(StatusText.SAVING);
    await saveFileMetadataToMongoDB(user.id, fileIdToUploadTo, file, downloadURL);

    // Step 3: Generate AI embeddings
    // setStatus(StatusText.GENERATING);
    // await generateEmbeddings(fileIdToUploadTo);

    setFileId(fileIdToUploadTo);
  };

  return { progress, status, fileId, handleUpload };
}

export default useUpload;

// Helper function to upload file to storage (e.g., AWS S3, Cloudinary)
async function uploadFileToStorage(file: File, fileId: string): Promise<string> {
  // Replace this with your file upload logic
  // Example: Upload to AWS S3
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileId", fileId);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  const { downloadURL } = await response.json();
  return downloadURL;
}

// Helper function to save file metadata to MongoDB
async function saveFileMetadataToMongoDB(
  userId: string,
  fileId: string,
  file: File,
  downloadURL: string
) {
  const client = await clientPromise;
  const db = client.db("your-database-name"); // Replace with your database name
  const collection = db.collection("files");

  await collection.insertOne({
    fileId,
    userId,
    name: file.name,
    size: file.size,
    type: file.type,
    downloadURL,
    createdAt: new Date(),
  });
}