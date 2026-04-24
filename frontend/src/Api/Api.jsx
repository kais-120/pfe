import axios from "axios";
import Cookies from "universal-cookie";
export const imageURL = "http://localhost:5000/uploads";
const baseURL = "http://localhost:5000/api/v1";
export const socketBaseURL = "http://localhost:5000";
const apiKey = "$2y$10$vTopjmWxQ4pNYZOtjGqEbuKfhYFTKJEgTNBbYv/fYMIIIEAvTHkPW"
const cookie = new Cookies();
export const Axios = axios.create({baseURL,
    headers:{
    "x_api_key":apiKey
}});
export const AxiosToken = axios.create({baseURL,
    headers:{
        "x_api_key":apiKey,
    }
})
AxiosToken.interceptors.request.use((config) => {
  const token = cookie.get("auth");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});