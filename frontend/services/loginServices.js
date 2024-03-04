import axios from "axios";

const LOGIN_URL = "https://100014.pythonanywhere.com/";
const CLIENT_ADMIN_URL = "https://100093.pythonanywhere.com/";
const SERVICE_KEY_URL = 'https://100105.pythonanywhere.com/';

const loginAxiosInstance = axios.create({
    baseURL: LOGIN_URL,
});

const clientAdminAxiosInstance = axios.create({
    baseURL: CLIENT_ADMIN_URL,
});

const serviceKeyAxiosInstance = axios.create({
    baseURL: SERVICE_KEY_URL,
});

export const getUserInfoFromLogin = async (session_id) => {
    return await loginAxiosInstance.post("api/userinfo/", { session_id });
};

export const getUserInfoFromClientAdmin = async (session_id) => {
    return await clientAdminAxiosInstance.post("api/userinfo/", { session_id });
};

export const getApiKeyInfoFromClientAdmin = async (workspace_id) => {
    return await serviceKeyAxiosInstance.get(`/api/v3/user/?type=get_api_key&workspace_id=${workspace_id}`);
};