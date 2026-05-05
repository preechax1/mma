
// const base = "http://localhost/OP3_MMA/api/test_utilization/history_file.php";

import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/history_file`;

export const getFiles = async (id) => {
    const res = await fetch(`${base}/get_files/${id}`);
    return res.json();
};

export const uploadFile = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${base}/upload/${id}`, {
        method: "POST",
        body: formData
    });
    return res.json();
};

export const deleteFile = async (id, fileName) => {
    const formData = new FormData();
    formData.append("name", fileName);

    const res = await fetch(`${base}/remove_file/${id}`, {
        method: "POST",
        body: formData
    });
    return res.json();
};