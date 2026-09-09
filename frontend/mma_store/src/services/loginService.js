import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getLogin = async (username, password) => {
    try {
        const res = await axios.post(`${API}/login`, { username, password });
        return res.data?.data || null;
    } catch (error) {
        console.error("Error fetching login:", error);
        return null;
    }
};
