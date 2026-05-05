export function lineData(arr) {
    return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: arr,
                borderColor: "#38bdf8",
                backgroundColor: "#38bdf8",
                tension: 0.4
            }
        ]
    }
}

export function objData(obj) {
    return {
        labels: Object.keys(obj),
        datasets: [
            {
                data: Object.values(obj),
                backgroundColor: "#60a5fa"
            }
        ]
    }
}

export function mapToObject(arr, key, value) {
    const obj = {};
    arr.forEach(r => {
        obj[r[key]] = Number(r[value]);
    });
    return obj;
}

export function statusColor(status) {
    // ป้องกันกรณี status เป็น null/undefined และปรับเป็นตัวพิมพ์เล็ก
    const s = status?.toLowerCase() || ""; 
    
    switch (s) {
        case "run": return "#22c55e";    // เขียว
        case "idle": return "#eab308";   // เหลือง
        case "down": return "#ef4444";   // แดง
        case "setup": return "#3b82f6";  // ฟ้า
        default: return "#475569";      // เทาเข้ม (สีที่คุณเห็นว่าดำ)
    }
}