import { data } from "autoprefixer";
import axios from "axios";
import { getSavedApiKey } from "../src/hooks/useDowellLogin";

const Q_SERVICES_URL = import.meta.env.VITE_BACKED_URL;
// const Q_SERVICES_URL = "http://127.0.0.1:8000";

const qServicesAxiosInstance = axios.create({
  baseURL: Q_SERVICES_URL,
});

export const getCheckMetaDatabaseStatus = async (workspace_id) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/kitchen-sink/?type=check_metedata_database_status&workspace_id=${workspace_id}`,
    { headers }
  );
};

export const getCheckDataDatabaseStatus = async (workspace_id, date) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/kitchen-sink/?type=check_data_database_status&workspace_id=${workspace_id}&date=${date}`,
    { headers }
  );
};

export const getUserDetails = async (workspace_id) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/user-services/?type=retrieve_user_details&workspace_id=${workspace_id}`,
    { headers }
  );
};

export const createCollection = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/kitchen-sink/?type=create_collection`,
    dataToPost,
    { headers }
  );
};

export const saveUserDetails = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/user-services/?type=save_user_details`,
    dataToPost,
    { headers }
  );
};

export const getStoreData = async (workspace_id) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/store-services/?type=retrieve_store_details&workspace_id=${workspace_id}&limit=5&offset=0`,
    { headers }
  );
};

export const createStore = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/store-services/?type=create_store`,
    dataToPost,
    { headers }
  );
};

export const getQrCode = async (workspace_id, user_id) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/qrcode-services/?type=retrieve_qrcoderecode_details&workspace_id=${workspace_id}&user_id=${user_id}&limit=5&offset=0&store_type=OFFLINE`,
    { headers }
  );
};

export const createQrCode = async (
  workspace_id,
  user_id,
  store_id,
  seat_no,
  dataToPost
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/qrcode-services/?type=create_qrcode&workspace_id=${workspace_id}&user_id=${user_id}&store_id=${store_id}&seat_number=${seat_no}`,
    dataToPost,
    { headers }
  );
};

export const getPaymentDetailForSeat = async (
  workspace_id,
  seat_no,
  date,
  store_id
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/offline-store-customer-services/?type=retrieve_orders_by_seat&workspace_id=${workspace_id}&seat_number=${seat_no}&date=${date}&store_id=${store_id}&limit=100&offset=0`,
    { headers }
  );
};

export const getQrCodeIdBySeatNumber = async (workspace_id, seat_no) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/qrcode-services/?type=retrieve_seat_details&workspace_id=${workspace_id}&seat_number=${seat_no}`,
    { headers }
  );
};

export const createCustomerPayment = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/customer-services/?type=create_customer_payment`,
    dataToPost,
    { headers }
  );
};

// /api/v3/customer-services/?type=update_payment_status&payment_receipt_id=65e30677871518f21b7afca9&date=2024_02_29&workspace_id=6385c0f18eca0fb652c94558

export const updatePaymentRecord = async (
  paymentReceiptId,
  date,
  qrcode_id,
  workspace_id,
  seat_no,
  store_id,
  store_type
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/offline-store-customer-services/?type=update_payment_status&payment_receipt_id=${paymentReceiptId}&date=${date}&workspace_id=${workspace_id}&qrcode_id=${qrcode_id}&seat_number=${seat_no}&store_id=${store_id}&store_type=${store_type}`,
    { headers }
  );
};

export const qrCodeActivationDeactivation = async (
  workspace_id,
  document_id,
  seat_status
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/qrcode-services/?type=activate_seat&workspace_id=${workspace_id}&document_id=${document_id}&seat_status=${seat_status}`,
    { headers }
  );
};

export const userAuth = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/user-services/?type=user_auth`,
    dataToPost,
    { headers }
  );
};

export const retrieveInitiatedOrder = async (
  workspace_id,
  seat_no,
  date,
  store_id
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/offline-store-customer-services/?type=retrive_initiated_order&workspace_id=${workspace_id}&seat_number=${seat_no}&date=${date}&store_id=${store_id}&limit=100&offset=0`,
    { headers }
  );
};

export const initiateNewOrder = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/offline-store-customer-services/?type=initiate_order`,
    dataToPost,
    { headers }
  );
};

export const initiateOlderOrder = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/offline-store-customer-services/?type=old_order`,
    dataToPost,
    { headers }
  );
};

export const updatStoreDataAPI = async (
  workspace_id,
  store_id,
  user_id,
  dataToPost
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/store-services/?type=update_store_data&workspace_id=${workspace_id}&store_id=${store_id}&user_id=${user_id}`,
    dataToPost,
    { headers }
  );
};

export const icreateMenu = async (
  workspace_id,
  user_id,
  store_id,
  dataToPost
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/store-services/?type=create_menu&workspace_id=${workspace_id}&user_id=${user_id}&store_id=${store_id}`,
    dataToPost,
    { headers }
  );
};

export const getMenuData = async (workspace_id, store_id, store_type) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/store-services/?type=retrieve_menu_details&workspace_id=${workspace_id}&store_id=${store_id}&limit=100&offset=0&store_type=${store_type}`,
    { headers }
  );
};

export const createOrder = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/offline-store-customer-services/?type=create_order`,
    dataToPost,
    { headers }
  );
};

export const getQrCodeOnline = async (workspace_id, user_id) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/qrcode-services/?type=retrieve_qrcoderecode_details&workspace_id=${workspace_id}&user_id=${user_id}&limit=5&offset=0&store_type=ONLINE`,
    { headers }
  );
};

export const getQrCodeOffline = async (workspace_id, user_id) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/qrcode-services/?type=retrieve_qrcoderecode_details&workspace_id=${workspace_id}&user_id=${user_id}&limit=5&offset=0&store_type=OFFLINE`,
    { headers }
  );
};

export const retrieveMasterQr = async (workspace_id, user_id) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/qrcode-services/?type=get_master_qrcode_record&workspace_id=${workspace_id}&user_id=${user_id}&limit=10&offset=0`,
    { headers }
  );
};

export const getInitiatedOrdersOnline = async (
  workspace_id,
  date,
  store_id
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/online-store-customer-services/?type=retieve_online_initiated_order&workspace_id=${workspace_id}&date=${date}&store_id=${store_id}&limit=100&offset=0`,
    { headers }
  );
};

export const createOnlineOrder = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/online-store-customer-services/?type=create_online_order`,
    dataToPost,
    { headers }
  );
};

// export const getPaymentDetailsForOnlineStoreSeats = async (
//   workspace_id,
//   date,
//   store_id
// ) => {
//   const headers = {
//     Authorization: `Bearer ${getSavedApiKey()}`,
//   };
//   return await qServicesAxiosInstance.get(`/v3/online-store-customer-services/?type=retieve_online_initiated_order&workspace_id=${workspace_id}&date=${date}&store_id=${store_id}&limit=10&offset=0`, { headers });
// }

export const createMasterQrCode = async (
  workspace_id,
  user_id,
  store_id,
  dataToPost
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3/qrcode-services/?type=create_master_qrcode&workspace_id=${workspace_id}&user_id=${user_id}&store_id=${store_id}`,
    dataToPost,
    { headers }
  );
};

export const getOnlineOrderBySeatNumber = async (
  workspace_id,
  date,
  store_id,
  seat_no
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/online-store-customer-services/?type=retrieve_online_orders_by_seat&workspace_id=${workspace_id}&store_id=${store_id}&date=${date}&seat_number=${seat_no}&limit=5&offset=0`,
    { headers }
  );
};

export const getOfflineOnlineMenuData = async (
  workspace_id,
  store_id,
  store_type
) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.get(
    `/v3/store-services/?type=retrieve_menu_details&workspace_id=${workspace_id}&store_id=${store_id}&limit=100&offset=0&store_type=${store_type}`,
    { headers }
  );
};

export const updateUserDetails = async (dataToPost) => {
  const headers = {
    Authorization: `Bearer ${getSavedApiKey()}`,
  };
  return await qServicesAxiosInstance.post(
    `/v3//user-services/?type=update_user_details`,
    dataToPost,
    { headers }
  );
};
