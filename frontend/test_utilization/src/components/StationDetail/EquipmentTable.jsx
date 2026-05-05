import { useState } from "react";
import { statusColor } from "../../utils/chartUtils";
import DetailForm from "./DetailForm";

export default function EquipmentTable({ tablestations }) {
    const [selectedTool, setSelectedTool] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        station: '',
        product: '',
        status: '',
        problem: '',
        readiness: '',
        utilization: '',
        mtbf: '',
        mttr: ''
    });

    const handleToolClick = (detail) => {
        setSelectedTool(detail);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTool(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        console.log("Update:", formData);
        handleCloseModal();
    };

    const handleFilterChange = (column, value) => {
        setFilters(prev => ({
            ...prev,
            [column]: value
        }));
    };

    // Filter the data based on current filters
    const filteredData = tablestations.filter(detail => {
        return (
            (!filters.station || detail.station?.toLowerCase().includes(filters.station.toLowerCase())) &&
            (!filters.product || detail.product?.toLowerCase().includes(filters.product.toLowerCase())) &&
            (!filters.status || detail.status?.toLowerCase().includes(filters.status.toLowerCase())) &&
            (!filters.problem || detail.problem?.toLowerCase().includes(filters.problem.toLowerCase())) &&
            (!filters.readiness || detail.readiness?.toLowerCase().includes(filters.readiness.toLowerCase())) &&
            (!filters.utilization || detail.Utilization?.toString().includes(filters.utilization)) &&
            (!filters.mtbf || detail.MTBF?.toString().includes(filters.mtbf)) &&
            (!filters.mttr || detail.MTTR?.toString().includes(filters.mttr))
        );
    });

    return (
        <div className="table-card">
            <div className="table-header">
                <h2>Equipment Status</h2>
                <div className="table-info">
                    Showing {filteredData.length} of {tablestations.length} stations
                </div>
            </div>

            <div className="table-container">
                <table className="fab-table">
                    <thead>
                        <tr>
                            <th>Station</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Problem</th>
                            {/* <th>Ready</th> */}
                            <th>Utilization</th>
                            <th>MTBF</th>
                            <th>MTTR</th>
                        </tr>
                        <tr className="filter-row">
                            <th>
                                <input
                                    type="text"
                                    placeholder="Filter station..."
                                    value={filters.station}
                                    onChange={(e) => handleFilterChange('station', e.target.value)}
                                    className="filter-input"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    placeholder="Filter product..."
                                    value={filters.product}
                                    onChange={(e) => handleFilterChange('product', e.target.value)}
                                    className="filter-input"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    placeholder="Filter status..."
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="filter-input"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    placeholder="Filter problem..."
                                    value={filters.problem}
                                    onChange={(e) => handleFilterChange('problem', e.target.value)}
                                    className="filter-input"
                                />
                            </th>
                            {/* <th>
                                <input
                                    type="text"
                                    placeholder="Filter ready..."
                                    value={filters.readiness}
                                    onChange={(e) => handleFilterChange('readiness', e.target.value)}
                                    className="filter-input"
                                />
                            </th> */}
                            <th>
                                <input
                                    type="text"
                                    placeholder="Filter utilization..."
                                    value={filters.utilization}
                                    onChange={(e) => handleFilterChange('utilization', e.target.value)}
                                    className="filter-input"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    placeholder="Filter MTBF..."
                                    value={filters.mtbf}
                                    onChange={(e) => handleFilterChange('mtbf', e.target.value)}
                                    className="filter-input"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    placeholder="Filter MTTR..."
                                    value={filters.mttr}
                                    onChange={(e) => handleFilterChange('mttr', e.target.value)}
                                    className="filter-input"
                                />
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.map(detail => (
                            <tr key={detail.station_id}>
                                <td>{detail.station}</td>
                                <td>{detail.product?.trim()}</td>
                                <td>
                                    <button
                                        className="status-button"
                                        onClick={() => handleToolClick(detail)}
                                        style={{
                                            backgroundColor: statusColor(detail.status),
                                            border: 'none',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            transition: 'all 0.2s ease',
                                            minWidth: '70px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.05)';
                                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        {detail.status}
                                    </button>
                                </td>
                                <td>{detail.problem || "-"}</td>
                                {/* <td className={detail.readiness === "Ready" ? "ready" : "not-ready"}>
                                    {detail.readiness}
                                </td> */}
                                <td>{detail.Utilization ?? 0}%</td>
                                <td>{detail.MTBF ?? 0} hr</td>
                                <td>{detail.MTTR ?? 0} hr</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DetailForm
                selectedTool={selectedTool}
                isModalOpen={isModalOpen}
                onCloseModal={handleCloseModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
}