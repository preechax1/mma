import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import FileModal from "./FileModal";
import styles from "./Record.module.css";

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
            to={`/record/recordid/${row.original?.fctID || ""}`}
            className={styles.link}
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
            className={`${styles.link} ${styles.serialLink}`}
          >
            {row.original?.serial || "-"}
          </Link>
        ),
      },

      { header: "Failures", accessorKey: "failures" },

      {
        header: "Fuse",
        accessorKey: "fuse",
        cell: ({ getValue }) => (getValue() === "1" ? (
          <span className="text-emerald-500 text-lg">●</span>
        ) : (
          <span className="text-slate-300 text-lg">○</span>
        )),
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
          ) : (
            "-"
          );
        },
      },

      { header: "Update", accessorKey: "date_update" },

      {
        header: "File",
        id: "file_action",
        cell: ({ row }) => {
          const recordId = row.original?.fctID;

          return recordId ? (
            <button
              onClick={() => setSelectedId(recordId)}
              className={styles.btnData}
            >
              Files
            </button>
          ) : (
            "-"
          );
        },
      },

      { header: "Remark", accessorKey: "remark" },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportCSV = () => {
    const headers = table
      .getVisibleLeafColumns()
      .map((col) => col.columnDef.header);

    const rows = table.getRowModel().rows.map((row) =>
      row
        .getVisibleCells()
        .map((cell) => `"${cell.getValue() ?? ""}"`),
    );

    const csvContent =
      "\uFEFF" + [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `records_export.csv`;
    link.click();
  };

  if (loading) {
    return null; // Handled in parent
  }

  return (
    <div className={styles.tableContainer}>
      
      {/* Search & Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.searchWrapper}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            className={styles.searchInput}
          />
        </div>

        <button
          onClick={exportCSV}
          className={styles.exportBtn}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.th}
                  >
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className={styles.thSort}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted()] ?? ""}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`${styles.tr} ${idx % 2 === 0 ? styles.trEven : styles.trOdd}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={styles.td}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className={styles.emptyState}
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Modal */}
      {selectedId && (
        <FileModal
          recordId={selectedId}
          isOpen={true}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}