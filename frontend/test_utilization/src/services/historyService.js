// const base = "http://localhost/OP3_MMA/api/test_utilization/downhistory.php";

import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/downhistory`;

export const getDownHistory = async () => {
    const res = await fetch(`${base}/all_list`);
    const result = await res.json();
    return result.data.map(row => ({
        id: row.utID,
        station: row.station || "Unknown",
        severity: "down", // หรือใช้ Logic row.status.toLowerCase()
        category: row.failure_category || "",
        problem: row.problem_found || "",
        cause: row.cause_of_problem || "",
        action: row.corrective_action || "",
        engineer: row.member || "",
        start_time: row.response_down,
        end_time: row.response_up
    }));
};


export const getFiles = async (id) => {
    const res = await fetch(`${base}/get_files/${id}`);
    const result = await res.json();
    return result.data;
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
