
// const base = "http://localhost/OP3_MMA/api/test_utilization/dashboard";

import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/dashboard`;

export const getReadiness = async () => {
    const res = await fetch(`${base}/readiness`);
    const result = await res.json();
    return result.data;
};


export const getStatus = async () => {
    const res = await fetch(`${base}/status`);
    const result = await res.json();
    return result.data;
};

export const getUtilization = async () => {
    const res = await fetch(`${base}/utilization`);
    const result = await res.json();
    return result.data;
};

export const getMTBF = async () => {
    const res = await fetch(`${base}/mtbf`);
    const result = await res.json();
    return result.data;
};

export const getMTTR = async () => {
    const res = await fetch(`${base}/mttr`);
    const result = await res.json();
    return result.data;
};

export const getFailure = async () => {
    const res = await fetch(`${base}/failure`);
    const result = await res.json();
    return result.data;
};