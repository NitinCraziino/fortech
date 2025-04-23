import axios from "axios";
//  const apiUrl = 'https://www.naisorders.com/api';
const apiUrl = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000, // 10 seconds timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API call error:", error);
    const responseError = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
      errors: error.response?.data?.errors || null,
    };
    if (error.response?.status === 401) {
      console.error("Unauthorized! Logging out...");

      // Clear user authentication data (e.g., token)
      localStorage.removeItem("token"); // Example: remove JWT from localStorage
      window.location.href = "/login";
      // Redirect to login page
      // const navigate = useNavigate();
      // navigate("/login");
    }
    return Promise.reject(responseError);
  }
);

/**
 * General function to make API calls
 * @param {string} method - The HTTP method (GET, POST)
 * @param {string} url - The API endpoint
 * @param {object} [data] - The request payload (for POST)
 * @param {object} [config] - Additional Axios config
 * @returns {Promise} - The response from the API
 */
const apiCall = async (method: string, url: string, data = {}, config = {}, formData: boolean) => {
  try {
    const headers = formData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    const options = {
      method,
      url,
      headers,
      ...config,
      ...(method.toUpperCase() === "POST" || method.toUpperCase() === "PUT" ? { data } : { params: data }),
    };

    const response = await api(options);
    return response.data;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

// Usage examples:

// GET Request
export const getApi = (url: string, params = {}, config = {}, formData = false) => {
  return apiCall("GET", `${url}`, params, config, formData);
};

// POST Request
export const postApi = (url: string, data = {}, config = {}, formData: boolean) => {
  return apiCall("POST", `${url}`, data, config, formData);
};

export const putApi = (url: string, data = {}, config = {}, formData: boolean) => {
  return apiCall("PUT", `${url}`, data, config, formData);
};

export const deleteApi = (url: string, data = {}, config = {}, formData: boolean) => {
  return apiCall("DELETE", `${url}`, data, config, formData);
};
