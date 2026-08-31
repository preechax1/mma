export const buildAppUrl = (baseUrl, token) => {
  const url = new URL(baseUrl);
  url.searchParams.set("token", token || "");
  return url.toString();
};

export const navigateToApp = (app, token) => {
  if (app === "fec") {
    window.location.href = buildAppUrl(import.meta.env.VITE_FEC_URL, token);
  } else if (app === "test_utilization") {
    window.location.href = buildAppUrl(import.meta.env.VITE_TEST_UTILIZATION_URL, token);
  }
};
