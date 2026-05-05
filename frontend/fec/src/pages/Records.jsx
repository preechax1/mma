import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getRecords } from "../services/RecordsService"; 

export default function Records() {
  const [searchParams] = useSearchParams();


  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [history, serial]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getRecords({ history, serial });
      setData(result);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-6 space-y-6 min-h-screen ${
        history === "1" ? "bg-gray-300" : "bg-gray-50"
      }`}
    >
      <h1 className="text-3xl font-bold text-gray-800">
        {history === "1" ? "History Records" : "Current Records"}
      </h1>

      <RecordsTable data={data} loading={loading} />
    </div>
  );
}