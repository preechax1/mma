
// const base = "http://localhost/OP3_MMA/api/test_utilization/DetailCardStation.php";


import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/DetailCardStation`;



export const getReadIMG = async (id) => {
    const res = await fetch(`${base}/get_files/${id}`);
    const result = await res.json();
    return result.data;
};

export const getPM = async (id) => {
    const res = await fetch(`${base}/pm/${id}`);
    const result = await res.json();
    return result.data;
};

export const getEquipment = async (id) => {
    const res = await fetch(`${base}/equipment/${id}`);
    const result = await res.json();
    return result.data;
};

export const getUtilizationSummary = async (id) => {
    const res = await fetch(`${base}/utilization_summary/${id}`);
    const result = await res.json();
    return result.data;
};

export const getStatusDetail = async (id) => {
    const res = await fetch(`${base}/status/${id}`);
    const result = await res.json();
    return result.data;
};

export const getReadiness = async (id) => {
    const res = await fetch(`${base}/readiness/${id}`);
    const result = await res.json();
    return result.data;
};

export const getTestTimeline = async (id) => {
    const res = await fetch(`${base}/testtimeline/${id}`);
    const result = await res.json();
    return result.data;
};