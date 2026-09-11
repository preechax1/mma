import { API_BASE_URL } from "./apiConfig";

const BASE_FILE = `${API_BASE_URL}/file_api.php`;

const parseResponse = async (response, action) => {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`${action} failed: server returned an invalid response`);
  }

  if (!response.ok || data?.status === 0) {
    throw new Error(data?.message || data?.detail || `${action} failed`);
  }

  return data;
};

/* ==============================
   GET FILES
============================== */
export const fetchFilesByRecord = async (id) => {
  const params = new URLSearchParams({
    id: String(id ?? ""),
    function: "get_files"
  });
  const response = await fetch(`${BASE_FILE}?${params}`);

  if (!response.ok) {
    throw new Error(`Unable to fetch files (HTTP ${response.status})`);
  }

  const data = await parseResponse(response, "Fetching files");
  return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
};

/* ==============================
   UPLOAD FILE
============================== */
export const uploadFile = async (id, file) => {
  const formData = new FormData();

  formData.append("id", id);
  formData.append("function", "upload");
  formData.append("fileupload[]", file);

  const response = await fetch(BASE_FILE, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Unable to upload file (HTTP ${response.status})`);
  }

  return parseResponse(response, "Uploading file");
};

/* ==============================
   UPLOAD SPARE IMAGE
============================== */
export const uploadSpareImage = async (id, file) => {
  if (!id || !(file instanceof File)) {
    throw new Error("A spare ID and image file are required");
  }

  const formData = new FormData();
  formData.append("id", String(id));
  formData.append("function", "upload_image");
  formData.append("file", file);

  const response = await fetch(BASE_FILE, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Unable to upload spare image (HTTP ${response.status})`);
  }

  return parseResponse(response, "Uploading spare image");
};

/* ==============================
   DELETE FILE
============================== */
export const deleteFile = async (fullPath) => {
  const formData = new FormData();

  formData.append("function", "remove_file");
  formData.append("name", fullPath);

  const response = await fetch(BASE_FILE, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Unable to delete file (HTTP ${response.status})`);
  }

  return parseResponse(response, "Deleting file");
};