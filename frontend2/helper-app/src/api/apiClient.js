export const BASE_URL = "http://<YOUR_LOCAL_IP>:5000"; // Not localhost!

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};
