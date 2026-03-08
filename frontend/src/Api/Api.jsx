import axios from "axios";
import Cookies from "universal-cookie";
export const imageURL = "http://localhost:5000/uploads";
const baseURL = "http://localhost:5000/api/v1";
const apiKey = "$2y$10$vTopjmWxQ4pNYZOtjGqEbuKfhYFTKJEgTNBbYv/fYMIIIEAvTHkPW"
const cookie = new Cookies();
const token = cookie.get("auth");
export const Axios = axios.create({baseURL,
    headers:{
    "x_api_key":apiKey
}});
export const AxiosToken = axios.create({baseURL,
    headers:{
        "x_api_key":apiKey,
        "Authorization":`Bearer ${token}`
    }
})