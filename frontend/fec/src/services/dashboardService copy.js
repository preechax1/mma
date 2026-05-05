import api from "./api";

const factories = [
  {
    name: "Waimea RoSH & Pipeline",
    fec_type: "Waimea RoSH & Pipeline"
  },
  {
    name: "Waimea farmily & Tofino",
    fec_type: "Waimea farmily & Tofino"
  },
  {
    name: "Waimea2&TofinoX",
    fec_type: "Waimea2&TofinoX"
  }
];

export const getFactories = () => factories;

export const fetchDashboardData = async () => {
  const results = {};
  let summary = {};

  for (let factory of factories) {
    try {
      const { data } = await api.get("/fec/dashboard.php", {
        params: {
          fec_type: factory.fec_type,
          function: "status_card"
        }
      });

      results[factory.name] = data.map((item) => {
        const value = Number(item.total);

        if (!summary[item.status]) summary[item.status] = 0;
        summary[item.status] += value;

        return {
          name: item.status,
          value
        };
      });

    } catch (err) {
      console.error("Fetch error:", factory.name, err);
    }
  }

  const summaryArray = Object.keys(summary).map((key) => ({
    name: key,
    value: summary[key]
  }));

  return { results, summaryArray };
};