export const calcMinutes = (start, end) => {

    if (!start || !end) return 0;

    const s = new Date(start);
    const e = new Date(end);

    const diff = (e - s) / 60000;

    if (isNaN(diff)) return 0;

    return Math.round(diff);

};

export const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return "0m";

    const years = Math.floor(minutes / (365 * 24 * 60));
    const months = Math.floor((minutes % (365 * 24 * 60)) / (30 * 24 * 60));
    const days = Math.floor((minutes % (30 * 24 * 60)) / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);

    return parts.join(' ');
};

export const exportCSV = (rows) => {

    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const csv = [
        headers.join(","),
        ...rows.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "history.csv";
    a.click();

    URL.revokeObjectURL(url);

};