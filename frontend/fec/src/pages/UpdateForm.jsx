import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  loadFormData,
  submitFormData,
  loadSelectOptions
} from "../services/updateform";



import FileDropzone  from "../components/form/FileDropzone";
import FormCard      from "../components/form/FormCard";
import InputGrid     from "../components/form/InputGrid";
import InputField    from "../components/form/InputField";
import TextareaField from "../components/form/TextareaField";
import SelectField   from "../components/form/SelectField";

export default function Register() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isUpdate = Boolean(id);
  const disabled = false;

  /* ================= FIX 1: INITIAL STATE ครบทุก field ================= */

  const [form, setForm] = useState({
    serial: "",
    board_no: "",
    product: "",
    fuse: "",
    fuse_rework: "",
    station: "",
    send_to: "",
    faillures: "",
    root_cause: "",
    disposition: "",
    remark: "",
    active: 1 
  });

  const [selectData, setSelectData] = useState({
    product: [],
    fuse: [],
    station: [],
    fuse_rework: [],
    send_to: []
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD SELECT ================= */

  useEffect(() => {
    loadSelects();
  }, [id]);

  const loadSelects = async () => {
    const keys = ["product", "fuse", "station", "fuse_rework", "send_to"];

    const results = await Promise.all(
      keys.map(key => loadSelectOptions(key, id))
    );

    const mapped = {};
    keys.forEach((key, i) => {
      mapped[key] = results[i];
    });

    setSelectData(mapped);
  };

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (isUpdate) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadFormData(id);

      if (data) {
        /* ================= FIX 2: map ค่าให้ครบ ================= */
        setForm({
          serial: data.serial || "",
          board_no: data.board_no || "",
          product: data.product || "",
          fuse: data.fuse || "",
          fuse_rework: data.fuse_rework || "",
          station: data.id_station || "",
          send_to: data.status || "",
          faillures: data.faillures || "",
          root_cause: data.root_cause || "",
          disposition: data.disposition || "",
          remark: data.remark || "",
          active: data.active ?? 1 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ================= UPLOAD ================= */

  const [uploadMsg, setUploadMsg] = useState("");
  useEffect(() => {
    if (uploadMsg) {
      const timer = setTimeout(() => {
        setUploadMsg("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [uploadMsg]);

  const handleUpload = useCallback(async (file) => {
    try {
      const fd = new FormData();
      fd.append("fileupload[]", file);
      fd.append("id", id || "");
      fd.append("function", "upload");

      const res = await axios.post(
        "/OP3_MMA/api/fec/file_api.php",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.status === 1) {
        setUploadMsg(res.data.message);
      } else {
        setUploadMsg("Upload failed");
      }

    } catch (err) {
      setUploadMsg("Upload error");
    }
  }, [id]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitFormData({
      form,
      id,
      isUpdate
    });

    navigate("/");
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div
        className={`w-full h-full overflow-auto px-6 py-6 ${
          !isUpdate ? "bg-green-200" : "bg-white"
        }`}
      >
        <h1 className="text-3xl font-bold">
          {isUpdate ? "Update Record" : "Create New Record"}
        </h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        <FormCard title="Product Information">
          <InputGrid>

            <SelectField
              label="Product"
              name="product"
              value={form.product}
              options={selectData.product}
              textKey="product"
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
              options={selectData.fuse}
              textKey="fuse"
              onChange={handleChange}
              disabled={disabled}
            />

          </InputGrid>
        </FormCard>

        <FormCard title="Failure Detail">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

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

            <SelectField
              label="Fuse Rework"
              name="fuse_rework"
              value={form.fuse_rework}
              options={selectData.fuse_rework}
              textKey="fuse_rework"
              onChange={handleChange}
              disabled={disabled}
            />

          </div>

          {!disabled && <FileDropzone onUpload={handleUpload} uploadMsg={uploadMsg} />}


        </FormCard>

        <FormCard title="Test Information">
          <InputGrid>

            <SelectField
              label="Station"
              name="station"
              value={form.station}
              options={selectData.station}
              textKey="station"
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
              name="send_to"
              value={form.send_to}
              options={selectData.send_to}
              textKey="send_to"
              onChange={handleChange}
              disabled={disabled}
            />

          </InputGrid>
        </FormCard>

        {!disabled && form.active === 1 && (
          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
            >
              {isUpdate ? "Update" : "Create"}
            </button>
          </div>
        )}

      </form>
    </div>
  );
}