import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  getDetailFEC,
  submitFormData,
  getOptions,
} from "../services/updateform";
import { API_BASE_URL } from "../services/apiConfig";

import FileDropzone     from "../components/form/FileDropzone";
import FormCard         from "../components/form/FormCard";
import InputGrid        from "../components/form/InputGrid";
import InputField       from "../components/form/InputField";
import TextareaField    from "../components/form/TextareaField";
import SelectField      from "../components/form/SelectField";

import styles from "./UpdateForm.module.css";

export default function Register() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isUpdate = Boolean(id);
  const disabled = false;

  const [form, setForm] = useState({
    fctID: "",
    serial: "",
    board_no: "",
    product: "",
    fuse: "",
    fuse_rework: "",
    id_station: "",
    status: "",
    faillures: "",
    root_cause: "",
    disposition: "",
    remark: "",
    active: 1,
  });

  const [selectData, setSelectData] = useState({
    product: [],
    modify_fuse: [],
    station: [],
    fuse_rework: [],
    sent_to: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSelects();
  }, [id]);

  const loadSelects = async () => {
    try {
      const data = await getOptions();
      if (data) {
        setSelectData(data);
      }
    } catch (err) {
      console.error("Load options error:", err);
    }
  };

  useEffect(() => {
    if (isUpdate) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getDetailFEC(id);

      if (data && data.detail) {
        setForm({
          fctID: data.detail.fctID || "",
          serial: data.detail.serial || "",
          board_no: data.detail.board_no || "",
          product: data.detail.product || "",
          fuse: data.detail.fuse || "",
          fuse_rework: data.detail.fuse_rework || "",
          id_station: data.detail.id_station || "",
          status: data.detail.status || "",
          faillures: data.detail.faillures || "",
          root_cause: data.detail.root_cause || "",
          disposition: data.detail.disposition || "",
          remark: data.detail.remark || "",
          active: data.detail.active ?? 1,
        });

        setSelectData({
          product: data.product || [],
          modify_fuse: data.modify_fuse || [],
          station: data.station || [],
          fuse_rework: data.fuse_rework || [],
          sent_to: data.sent_to || [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [uploadMsg, setUploadMsg] = useState("");
  useEffect(() => {
    if (uploadMsg) {
      const timer = setTimeout(() => {
        setUploadMsg("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadMsg]);

  const handleUpload = useCallback(
    async (file) => {
      if (!id) {
        alert("Please save the record first before uploading files.");
        return;
      }

      try {
        const fd = new FormData();
        fd.append("fileupload[]", file);
        fd.append("id", id || "");
        fd.append("function", "upload");

        const res = await axios.post(`${API_BASE_URL}/file_api.php`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.status === 1) {
          setUploadMsg(res.data.message);
        } else {
          setUploadMsg("Upload failed: " + (res.data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Upload error:", err);
        setUploadMsg("Upload error: " + (err.response?.data?.message || err.message));
      }
    },
    [id],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const memberID = user?.memberID || "";

      const res = await submitFormData({
        form,
        id,
        isUpdate,
        memberID,
      });

      if (res?.status === 1 || res?.success) {
        alert(res?.message || "Saved successfully!");
        navigate("/");
      } else {
        alert(res?.message || "Failed to save data");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error: " + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      <div className={styles.formWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {isUpdate ? "Update Record" : "Create New Record"}
          </h1>
          <p className={styles.subtitle}>
            {isUpdate
              ? `Editing record ID: ${id}`
              : "Fill in the details to create a new production record"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Section 1 */}
          <FormCard title="Product Information">
            <InputGrid>
              <SelectField
                label="Product"
                name="product"
                value={form.product}
                options={selectData.product}
                textKey="value"
                onChange={handleChange}
                disabled={disabled}
              />
              <InputField
                label="Serial"
                name="serial"
                value={form.serial}
                onChange={handleChange}
                disabled={disabled}
              />
              <InputField
                label="Board No"
                name="board_no"
                value={form.board_no}
                onChange={handleChange}
                disabled={disabled}
              />
              <SelectField
                label="Modify Fuse"
                name="fuse"
                value={form.fuse}
                options={selectData.modify_fuse}
                textKey="value"
                onChange={handleChange}
                disabled={disabled}
              />
            </InputGrid>
          </FormCard>

          {/* Section 2 */}
          <FormCard title="Failure Detail">
            {/* ปรับแก้จาก Grid 4 คอลัมน์ที่เบียดกัน เป็นระบบคอลัมน์ที่สมดุล */}
            <div className={styles.failureGrid}>
              <div className={styles.textareaGroup}>
                <TextareaField
                  label="Failures"
                  name="faillures"
                  value={form.faillures}
                  onChange={handleChange}
                  disabled={disabled}
                />
                <TextareaField
                  label="Root Cause"
                  name="root_cause"
                  value={form.root_cause}
                  onChange={handleChange}
                  disabled={disabled}
                />
                <TextareaField
                  label="Disposition"
                  name="disposition"
                  value={form.disposition}
                  onChange={handleChange}
                  disabled={disabled}
                />
              </div>
              
              <div className={styles.uploadGroup}>
                <SelectField
                  label="Fuse Rework"
                  name="fuse_rework"
                  value={form.fuse_rework}
                  options={selectData.fuse_rework}
                  textKey="value"
                  onChange={handleChange}
                  disabled={disabled}
                />
                {!disabled && (
                  <div className={styles.dropzoneWrapper}>
                    <label className={styles.fieldLabel}>Attachment File</label>
                    <FileDropzone onUpload={handleUpload} uploadMsg={uploadMsg} />
                  </div>
                )}
              </div>
            </div>
          </FormCard>

          {/* Section 3 */}
          <FormCard title="Test Information">
            <InputGrid>
              <SelectField
                label="Station"
                name="id_station"
                value={form.id_station}
                options={selectData.station}
                textKey="value"
                onChange={handleChange}
                disabled={disabled}
              />
              <InputField
                label="Remark"
                name="remark"
                value={form.remark}
                onChange={handleChange}
                disabled={disabled}
              />
              <SelectField
                label="Send To"
                name="status"
                value={form.status}
                options={selectData.sent_to}
                textKey="value"
                onChange={handleChange}
                disabled={disabled}
              />
            </InputGrid>
          </FormCard>

          {/* ปุ่ม Submit แยกออกมาด้านล่างสุดของฟอร์มหลักให้สมดุลและคลิกง่าย */}
          {!disabled && Number(form.active) === 1 && (
            <div className={styles.submitSection}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {isUpdate ? "Update Record" : "Create Record"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}