import { useRef } from "react";

export default function FileDropzone({ 
  onUpload, 
  multiple = false,
  uploadMsg   // ✅ รับค่าจาก parent
}) {

  const inputRef = useRef();

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    if (multiple) {
      Array.from(files).forEach(file => onUpload && onUpload(file));
    } else {
      onUpload && onUpload(files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition rounded-xl p-4 text-center cursor-pointer bg-gray-50"
      >
        <input
          type="file"
          ref={inputRef}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <p className="text-gray-600 font-medium">
          Drag & Drop file here
        </p>
        <p className="text-sm text-gray-400 mt-2">
          or click to select file
        </p>
      </div>

      {/* ✅ แสดงผลตรงนี้ */}
      {uploadMsg && (
        <div className="text-green-600 font-medium mt-2">
          {uploadMsg}
        </div>
      )}

    </div>
  );
}