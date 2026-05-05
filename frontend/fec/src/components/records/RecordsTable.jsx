import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import FileModal from "./FileModal";
import "./RecordsTable.css";

export default function RecordsTable({ data = [], loading }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "fctID" },
      { header: "Product", accessorKey: "product" },

      {
        header: "Serial",
        accessorKey: "serial",
        cell: ({ row }) => (
          <Link
            to={`/records?serial=${row.original?.serial || ""}&history=1`}
            className="records-link"
          >
            {row.original?.serial || "-"}
          </Link>
        )
      },

      { header: "Failures", accessorKey: "faillures" },
      { header: "Fuse", accessorKey: "fuse" },

      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const id = row.original?.fctID;
          const status = row.original?.status;

          if (!id) return "-";

          return (
            <Link to={`/updateform/${id}`}>
              <StatusBadge status={status} />
            </Link>
          );
        }
      },

      { header: "Last Update", accessorKey: "date_update" },

      // ✅ File Column
      {
        header: "File",
        accessorKey: "id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const recordId =
            row.original?.fctID ||
            row.original?.board_no ||
            null;

          if (!recordId) return "-";

          return (
            <button
              type="button"
              className="records-button primary"
              onClick={() => setSelectedId(recordId)}
            >
              Data
            </button>
          );
        }
      },

      { header: "Remark", accessorKey: "remark" }
    ],
    [setSelectedId]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      columnVisibility
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const exportCSV = () => {
    const headers = table
      .getVisibleLeafColumns()
      .map(col => col.columnDef.header);

    const rows = table.getRowModel().rows.map(row =>
      row.getVisibleCells().map(cell => cell.getValue())
    );

    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "records.csv";
    link.click();
  };

  if (loading) {
    return <div className="records-loading">Loading...</div>;
  }

 return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Controls */}
      <div className="records-controls">
        <input
          value={globalFilter ?? ""}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Global search..."
          className="records-search"
        />

        <div className="records-actions">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="records-select"
          >
            {[10, 25, 50, 100, data.length || 10].map(size => (
              <option key={size} value={size}>
                {size === data.length ? "All" : `${size} rows`}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="records-button primary"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Column Toggle */}
      <div className="records-columns">
        {table.getAllLeafColumns().map(column => (
          <label key={column.id}>
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />
            {column.columnDef.header}
          </label>
        ))}
      </div>

      {/* ====== TABLE AREA (SCROLL ONLY HERE) ====== */}
      <div className="flex-1 overflow-hidden relative">

        <div className="records-table-container h-full overflow-auto">
          <table className="records-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <React.Fragment key={headerGroup.id}>
                  <tr>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ▲",
                          desc: " ▼"
                        }[header.column.getIsSorted()] ?? ""}
                      </th>
                    ))}
                  </tr>

                  <tr>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.column.getCanFilter() && (
                          <input
                            value={header.column.getFilterValue() ?? ""}
                            onChange={e =>
                              header.column.setFilterValue(e.target.value)
                            }
                            placeholder="Filter..."
                            className="records-filter-input"
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={index % 2 === 0 ? "even" : "odd"}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell ??
                          cell.column.columnDef.accessorKey,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ===== FIXED ENTERPRISE PAGINATION ===== */}
      <div className="records-pagination fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 flex justify-between items-center shadow-md">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="records-button"
        >
          Previous
        </button>

        <span className="font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="records-button"
        >
          Next
        </button>
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