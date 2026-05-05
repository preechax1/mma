const base = "http://localhost/OP3_MMA/api/test_utilization/history_file.php";

/* ================= GET FILES ================= */

export const getFiles = async (id) => {

    const res = await fetch(`${base}?function=get_files&id=${id}`);

    const data = await res.json();

    return data;

};


/* ================= UPLOAD ================= */

export const uploadFile = async (id, file) => {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("id", id);
    formData.append("function", "upload");

    const res = await fetch(base, {
        method: "POST",
        body: formData
    });

    return res.json();

};


/* ================= DELETE ================= */

export const deleteFile = async (path) => {

    const formData = new FormData();

    formData.append("name", path);
    formData.append("function", "remove_file");

    const res = await fetch(base, {
        method: "POST",
        body: formData
    });

    return res.json();

};