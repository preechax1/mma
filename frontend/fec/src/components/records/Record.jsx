// D:\Docker\mma\frontend\fec\src\components\records\Record.jsx
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import FileModal from "./FileModal";

export default function RecordsTable({ data = [], loading }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "fctID",
        cell: ({ row }) => (
          <Link
            // คลิก ID วิ่งไปหา API recordid
            to={`/record/recordid/${row.original?.fctID || ""}`}
            className="text-blue-600 hover:underline font-bold"
          >
            {row.original?.fctID || "-"}
          </Link>
        ),
      },
      { header: "Station", accessorKey: "station" },
      { header: "Product", accessorKey: "product" },
      {
        header: "Serial",
        accessorKey: "serial",
        cell: ({ row }) => (
          <Link
            to={`/record/recordsn/${row.original?.serial || ""}`}
            className="text-green-600 hover:underline font-mono font-medium"
          >
            {row.original?.serial || "-"}
          </Link>
        ),
      },
      { header: "Failures", accessorKey: "failures" },
      {
        header: "Fuse",
        accessorKey: "fuse",
        cell: ({ getValue }) => (getValue() === "1" ? "✅" : "❌"),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const id = row.original?.fctID;
          const status = row.original?.status;
          return id ? (
            <Link to={`/updateform/${id}`}>
              <StatusBadge status={status} />
            </Link>
          ) : "-";
        },
      },
      { header: "Last Update", accessorKey: "date_update" },
      {
        header: "File",
        id: "file_action",
        cell: ({ row }) => {
          const recordId = row.original?.fctID;
          return recordId ? (
            <button
              onClick={() => setSelectedId(recordId)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
            >
              Data
            </button>
          ) : "-";
        },
      },
      { header: "Remark", accessorKey: "remark" },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportCSV = () => {
    const headers = table.getVisibleLeafColumns().map((col) => col.columnDef.header);
    const rows = table.getRowModel().rows.map((row) =>
      row.getVisibleCells().map((cell) => `"${cell.getValue() ?? ""}"`)
    );
    const csvContent = "\uFEFF" + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `records_export.csv`;
    link.click();
  };

  if (loading) return <div className="p-10 text-center font-bold">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      {/* Search & Action Bar */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="ค้นหาทั้งหมด..."
          className="border px-4 py-2 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
          Export CSV
        </button>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-100 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 border-b text-sm font-semibold text-gray-700">
                    <div onClick={header.column.getToggleSortingHandler()} className="cursor-pointer">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted()] ?? ""}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr key={row.id} className={`hover:bg-blue-50 border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 text-sm text-gray-600">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t flex justify-between items-center bg-gray-50">
        <div className="flex gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-4 py-1 border rounded bg-white disabled:opacity-30">Prev</button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-4 py-1 border rounded bg-white disabled:opacity-30">Next</button>
        </div>
        <span className="text-sm">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
      </div>

      {/* Modal */}
      {selectedId && <FileModal recordId={selectedId} isOpen={true} onClose={() => setSelectedId(null)} />}
    </div>
  );
}