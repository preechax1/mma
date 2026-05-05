import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

import "../styles/StationDetail.css";

import {
    getStatusStation,
    getFailurePareto,
    getTopDowntime,
    getTableStation
} from "../services/StationDetailService";

import { objData } from "../utils/chartUtils";

import ChartCard from "../components/StationDetail/ChartCard";
import StatusStation from "../components/StationDetail/StatusStation";
import EquipmentTable from "../components/StationDetail/EquipmentTable";

export default function StationDetail() {
    const [details, setTools] = useState([]);
    const [failure, setFailure] = useState({});
    const [topdowntime, setTopdowntime] = useState({});
    const [tablestation, setTablestation] = useState([]);

    // Loading states for each section
    const [loadingTools, setLoadingTools] = useState(true);
    const [loadingFailure, setLoadingFailure] = useState(true);
    const [loadingDowntime, setLoadingDowntime] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);

    // Load status station data
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const statusRes = await getStatusStation();
                const tableRes  = await getTableStation(); // Load table data first to get IDs

                // console.log('Status data:', statusRes);
                // console.log('Table data:', tableRes);

                const statusData = statusRes.map(r => {
                    // Find matching station in table data to get the ID
                    const tableStation = tableRes.find(t => t.station === r.station);
                    // console.log(`Station ${r.station}:`, tableStation);

                    return {
                        id_station: r.id_station ,
                        station_name: r.station,
                        status: r.status.toUpperCase()
                    };
                });
                // console.log('Final status data:', statusData);
                setTools(statusData);
            } catch (error) {
                console.error('Error loading status station:', error);
            } finally {
                setLoadingTools(false);
            }
        };
        loadStatus();
    }, []);

    // Load failure pareto data
    useEffect(() => {
        const loadFailure = async () => {
            try {
                const failureRes = await getFailurePareto();
                const failureData = {};
                failureRes.forEach(r => {
                    failureData[r.failure_category] = Number(r.total);
                });
                setFailure(failureData);
            } catch (error) {
                console.error('Error loading failure pareto:', error);
            } finally {
                setLoadingFailure(false);
            }
        };
        loadFailure();
    }, []);

    // Load top downtime data
    useEffect(() => {
        const loadDowntime = async () => {
            try {
                const downtimeRes = await getTopDowntime();
                const downtimeData = {};
                downtimeRes.forEach(r => {
                    downtimeData[r.station] = Number(r.Total);
                });
                setTopdowntime(downtimeData);
            } catch (error) {
                console.error('Error loading top downtime:', error);
            } finally {
                setLoadingDowntime(false);
            }
        };
        loadDowntime();
    }, []);

    // Load table station data
    useEffect(() => {
        const loadTable = async () => {
            try {
                const tableRes = await getTableStation();
                setTablestation(tableRes);
            } catch (error) {
                console.error('Error loading table station:', error);
            } finally {
                setLoadingTable(false);
            }
        };
        loadTable();
    }, []);

    // Calculate KPI values
    const totalStations = details.length;
    const readyStations = details.filter(detail => detail.status === 'READY').length;
    const notReadyStations = totalStations - readyStations;
    const readinessPercentage = totalStations > 0 ? Math.round((readyStations / totalStations) * 100) : 0;
    const totalFailures = Object.values(failure).reduce((sum, val) => sum + val, 0);
    const totalDowntime = Object.values(topdowntime).reduce((sum, val) => sum + val, 0);

    return (
        <div className="station-container">
            {/* Header Section */}
            <div className="station-header">
                <div className="header-content">
                    <h1 className="station-title">🏭 Station Detail Monitor</h1>
                    <p className="station-subtitle">
                        Real-time monitoring and analytics for MMA test stations
                    </p>
                </div>
            </div>

         

            {/* Station Status Section */}
            <div className="status-section">
                <h2 className="section-title">🔴 Station Status Overview</h2>
                <div className="status-content">
                    {loadingTools ? (
                        <div className="loading-placeholder">
                            <div className="loading-spinner"></div>
                            <span>Loading station status...</span>
                        </div>
                    ) : (
                        <StatusStation details={details} />
                    )}
                </div>
            </div>

            {/* Analytics Charts Section */}
            <div className="analytics-section">
                <h2 className="section-title">📈 Performance Analytics</h2>
                <div className="chart-grid">
                    {loadingFailure ? (
                        <div className="loading-placeholder">
                            <div className="loading-spinner"></div>
                            <span>Loading failure data...</span>
                        </div>
                    ) : (
                        <ChartCard title="Failure Pareto Analysis">
                            <Bar data={objData(failure)} />
                        </ChartCard>
                    )}

                    {loadingDowntime ? (
                        <div className="loading-placeholder">
                            <div className="loading-spinner"></div>
                            <span>Loading downtime data...</span>
                        </div>
                    ) : (
                        <ChartCard title="Top Downtime Stations">
                            <Bar data={objData(topdowntime)} />
                        </ChartCard>
                    )}
                </div>
            </div>

            {/* Equipment Details Section */}
            <div className="equipment-section">
                <h2 className="section-title">🔧 Equipment Details</h2>
                <div className="equipment-content">
                    {loadingTable ? (
                        <div className="loading-placeholder">
                            <div className="loading-spinner"></div>
                            <span>Loading equipment table...</span>
                        </div>
                    ) : (
                        <EquipmentTable tablestations={tablestation} />
                    )}
                </div>
            </div>
        </div>
    );
}