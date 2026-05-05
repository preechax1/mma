import api from "./api";

const BASE_PATH = "/fec/api_record.php";

export const fetchRecords = async ({ history = "0", serial = "" }) => {
  const { data } = await api.get(BASE_PATH, {
    params: {
      history,
      serial,
      function: "data_table"
    }
  });

  return data || [];
};