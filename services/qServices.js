import { data } from "autoprefixer";
import axios from "axios";
import { getSavedApiKey } from "../src/hooks/useDowellLogin";

const Q_SERVICES_URL = 'http://127.0.0.1:8000/';

const qServicesAxiosInstance = axios.create({
    baseURL: Q_SERVICES_URL,
});


export const getCheckMetaDatabaseStatus = async (workspace_id) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.get(`api/v1/kitchen-sink/?type=check_metedata_database_status&workspace_id=${workspace_id}`, { headers });
};

export const getCheckDataDatabaseStatus = async (workspace_id, date) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.get(`/api/v1/kitchen-sink/?type=check_data_database_status&workspace_id=${workspace_id}&date=${date}`, { headers });
};

export const getUserDetails = async (workspace_id) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.get(`/api/v1/user-services/?type=retrieve_user_details&workspace_id=${workspace_id}`, { headers });
};

export const createCollection = async (dataToPost) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.post(`/api/v1/kitchen-sink/?type=create_collection`, dataToPost, { headers });
};

export const saveUserDetails = async (dataToPost) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.post(`api/v1/user-services/?type=save_user_details`, dataToPost, { headers });
}

export const getStoreData = async (workspace_id) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.get(`/api/v1/store-services/?type=retrieve_store_details&workspace_id=${workspace_id}&limit=5&offset=0`, { headers });
};

export const createStore = async (dataToPost) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.post(`api/v1/store-services/?type=create_store`, dataToPost, { headers })
}

export const getQrCode = async (workspace_id, user_id) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.get(`/api/v1/qrcode-services/?type=retrieve_qrcoderecode_details&workspace_id=${workspace_id}&user_id=${user_id}&limit=5&offset=0`, { headers });
};


export const createQrCode = async (workspace_id, user_id, seat_no, dataToPost) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.post(`/api/v1/qrcode-services/?type=create_qrcode&workspace_id=${workspace_id}&user_id=${user_id}&seat_number=${seat_no}`, dataToPost, { headers });
};

export const getPaymentDetailForSeat = async (workspace_id, seat_no, date, store_id, dataToPost) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.post(`/api/v1/customer-services/?type=retrieve_seat_customers&workspace_id=${workspace_id}&seat_number=${seat_no}&date=${date}&store_id=${store_id}&limit=5&offset=0`,
        dataToPost, { headers });
};

export const getQrCodeIdBySeatNumber = async (workspace_id, seat_no) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.get(`/api/v1/qrcode-services/?type=retrieve_seat_details&workspace_id=${workspace_id}&seat_number=${seat_no}`, { headers });
};

export const createCustomerPayment = async (dataToPost) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.post(`/api/v1/customer-services/?type=create_customer_payment`, dataToPost, { headers });
};

// /api/v1/customer-services/?type=update_payment_status&payment_receipt_id=65e30677871518f21b7afca9&date=2024_02_29&workspace_id=6385c0f18eca0fb652c94558

export const updatePaymentRecord = async (paymentReceiptId, date, qrcode_id, workspace_id, seat_no) => {
    const headers = {
        'Authorization': `Bearer ${getSavedApiKey()}`
    };
    return await qServicesAxiosInstance.get(`/api/v1/customer-services/?type=update_payment_status&payment_receipt_id=${paymentReceiptId}&date=${date}&workspace_id=${workspace_id}&qrcode_id=${qrcode_id}&seat_number=${seat_no}`, { headers });
};