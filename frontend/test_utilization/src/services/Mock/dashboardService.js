export const getTools = () => {
  return [
    { id: 1, ready: true, status: "Run", utilization: 85, mtbf: 160, mttr: 20, failure: "RF" },
    { id: 2, ready: true, status: "Idle", utilization: 65, mtbf: 120, mttr: 30, failure: "Gas" },
    { id: 3, ready: false, status: "Down", utilization: 40, mtbf: 90, mttr: 50, failure: "Vacuum" },
    { id: 4, ready: true, status: "Setup", utilization: 70, mtbf: 200, mttr: 15, failure: "Robot" },
    { id: 5, ready: false, status: "TEUse", utilization: 55, mtbf: 140, mttr: 25, failure: "Chamber" }
  ];
};