import { useState, useEffect } from "react";
import {
    getCheckMetaDatabaseStatus,
    getCheckDataDatabaseStatus,
    getUserDetails,
    createCollection,
    saveUserDetails,
    getStoreData,
    createStore,
    getQrCode,
} from "../../../services/qServices";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { CircularProgress, Modal } from "@mui/material";
import { formatDateForAPI } from "../../helpers/helpers";
import { NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE, getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import { useNavigate } from "react-router-dom";

const API_URLS = [
    "You're almost ready to use the app!",
    "Setting up the 'Q' app.",
    "We're currently configuring user information.",
    "We're currently updating store details.",
    "We're currently arranging seating.",
];

const InitialConfigurationScreen = () => {
    const navigate = useNavigate();
    const currentDate = new Date();
    const {
        currentUser,
        currentUserDetailLoading,
        currentUserApiKey,
        intialConfigurationLoaded,
        setIntialConfigurationLoaded,
        qrCodeResponse,
        setQrCodeResponse,
        storeDetailsResponse,
        setStoreDetailsResponse,
    } = useCurrentUserContext();
    const [showModal, setShowModal] = useState(true);
    const [showContactAdministration, setShowContactAdministration] = useState({
        show: false,
        message: "",
    });
    const [loadingData, setLoadingData] = useState({
        isMetaDbLoading: false,
        isDataDbLoading: false,
        isUserDetailsLoading: false,
        isSeatDataLoading: false,
        isQrCodeLoading: false,
    });
    const [open, setOpen] = useState(true);
    const [step, setStep] = useState(0);
    const [userDetails, setUserDetails] = useState([]);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (!currentUser || !currentUserApiKey) return;
        // currentUser?.userinfo?.client_admin_id
        console.log("curent userrrr>>>>>>>>>", currentUser);
        if (intialConfigurationLoaded === true) return setShowModal(false);
        setLoadingData({
            isMetaDbLoading: true,
            isDataDbLoading: false,
            isUserDetailsLoading: false,
            isSeatDataLoading: false,
            isQrCodeLoading: false,
        });
        getCheckMetaDatabaseStatus(currentUser?.userinfo?.client_admin_id)
            .then((res) => {
                console.log("resssss", res);

                setLoadingData((prevLoadingData) => ({
                    ...prevLoadingData,
                    isMetaDbLoading: false,
                    isDataDbLoading: true,
                }));
                //checking for data db response now
                handleDataDatabaseStatus();
            })
            .catch((err) => {
                console.log("status", err);
                setLoadingData((prevLoadingData) => ({
                    ...prevLoadingData,
                    isMetaDbLoading: false,
                }));
                if (err?.response?.status === 501) {
                    setShowContactAdministration({
                        show: true,
                        message: err?.response?.data?.message,
                    });
                }
                if (err?.response?.status === 404) {
                    console.log(err?.response?.data?.response);
                    const promises = err?.response?.data?.response?.map((collection) => {
                        const dataToPost = {
                            workspace_id: currentUser?.userinfo?.client_admin_id,
                            database_type: "META DATA",
                            collection_name: collection,
                        };
                        return createCollection(dataToPost);
                    });

                    Promise.all(promises).then(() => {
                        handleDataDatabaseStatus();
                    });
                }
                if (err?.response?.status === 400) {
                    navigate("/error");
                }
            });
    }, [currentUser, currentUserApiKey]);

    const handleDataDatabaseStatus = async () => {
        getCheckDataDatabaseStatus(
            currentUser?.userinfo?.client_admin_id,
            formatDateForAPI(currentDate)
        )
            .then((res) => {
                console.log("res get check data database status", res?.data);
                setLoadingData((prevLoadingData) => ({
                    ...prevLoadingData,
                    isDataDbLoading: false,
                    isUserDetailsLoading: true,
                }));
                //checking for User details
                handlegetUserDetails();
            })
            .catch((err) => {
                console.log("error in data database api", err);

                if (err?.response?.status === 501) {
                    setShowContactAdministration({
                        show: true,
                        message: err?.response?.data?.message,
                    });
                }
                if (err?.response?.status === 404) {
                    console.log(err?.response?.data?.response);
                    const promises = err?.response?.data?.response?.map((collection) => {
                        const dataToPost = {
                            workspace_id: currentUser?.userinfo?.client_admin_id,
                            database_type: "DATA",
                            collection_name: collection,
                        };

                        return createCollection(dataToPost);
                    });
                    Promise.all(promises)
                        .then(() => {
                            handlegetUserDetails();
                        })
                        .catch(() => {
                            if (err?.response?.status === 400) {
                                navigate("/error");
                            }
                        });
                }
                if (err?.response?.status === 400) {
                    navigate("/error");
                }
                setLoadingData((prevLoadingData) => ({
                    ...prevLoadingData,
                    isDataDbLoading: false,
                    isUserDetailsLoading: true,
                }));
            });
    };

    const handlegetUserDetails = async () => {
        await getUserDetails(currentUser?.userinfo?.client_admin_id)
            .then((res) => {
                console.log(
                    "get user details resssss",
                    res?.response?.data?.response
                );
            })
            .catch((err) => {
                if (err?.response?.status === 302) {
                    console.log(
                        "get user details resssss......",
                        err?.response?.data?.response
                    );
                    setUserDetails(err?.response?.data?.response);
                    sessionStorage.setItem(
                        NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE,
                        JSON.stringify(err?.response?.data?.response)
                    );
                    setLoadingData((prevLoadingData) => ({
                        ...prevLoadingData,
                        isUserDetailsLoading: false,
                        isSeatDataLoading: true,
                    }));
                    handleGetStoreData(err?.response?.data?.response);
                }
                if (err?.response?.status === 404) {
                    // setLoadingData(prevLoadingData => ({ ...prevLoadingData, isUserDetailsLoading: false }))
                    handleSaveUserDetails();
                }
                if (err?.response?.status === 400) {
                    navigate("/error");
                }
            });
    };

    const handleSaveUserDetails = async () => {
        const dataToPost = {
            name: `${currentUser?.userinfo?.first_name} ${currentUser?.userinfo?.last_name}`,
            email: currentUser?.userinfo?.email,
            bank_details: {},
            username: currentUser?.userinfo?.username,
            workspace_id: currentUser?.userinfo?.client_admin_id,
            timezone: currentUser?.userinfo?.timezone,
        };

        await saveUserDetails(dataToPost)
            .then((res) => {
                console.log("res save user details", res);
                // setLoadingData(prevLoadingData => ({ ...prevLoadingData, isUserDetailsLoading: false, isSeatDataLoading: true }));
                handlegetUserDetails();
            })
            .catch((err) => {
                console.log("err save user details", err);
                if (err?.response?.status === 404) {
                }
                if (err?.response?.status === 400) {
                    navigate("/error");
                }
            });
    };

    const handleGetStoreData = async (passed_user_details) => {
        console.log("1", passed_user_details[0]?.store_ids?.online_store_id);
        await getStoreData(currentUser?.userinfo?.client_admin_id)
            .then(async (res) => {
                console.log("get store data", res?.data?.response);

                if (res?.data?.response?.length === 0) {
                    // if()
                    const dataToPost = {
                        store_id: [passed_user_details[0]?.store_ids?.online_store_id, passed_user_details[0]?.store_ids?.offline_store_id],
                        workspace_id: currentUser?.userinfo?.client_admin_id,
                        user_id: passed_user_details[0]?._id,
                        timezone: currentUser?.userinfo?.timezone,
                    };

                    await createStore(dataToPost)
                        .then(() => {
                            console.log("online store created");
                            handleGetStoreData(passed_user_details);
                        })
                        .catch((err) => {
                            if (err?.response?.status === 400) {
                                navigate("/error");
                            }
                        });
                } else {
                    setStoreDetailsResponse(res?.data?.response);
                }
                setLoadingData((prevLoadingData) => ({
                    ...prevLoadingData,
                    isSeatDataLoading: false,
                    isQrCodeLoading: true,
                }));
                handleGetQrCode(passed_user_details);
            })
            .catch((err) => {
                console.log("err get store data", err);
                if (err?.response?.status === 400) {
                    navigate("/error");
                }
            });
    };

    const handleGetQrCode = async (passed_user_details) => {
        // const _userId = a userDetails;
        console.log("2", passed_user_details);
        await getQrCode(
            currentUser?.userinfo?.client_admin_id,
            passed_user_details[0]?._id
        )
            .then(async (res) => {
                console.log("qr code resssss", res);
                if (res?.data?.response?.length === 0) {
                    setShowBanner(true);
                }
                setLoadingData((prevLoadingData) => ({
                    ...prevLoadingData,
                    isQrCodeLoading: false,
                }));
                setShowModal(false);
                setQrCodeResponse(res?.data?.response);
                setIntialConfigurationLoaded(true);
                navigate(`${passed_user_details[0]?.default_store_type?.toLocaleLowerCase()}-store`);
                toast.success('Success');
                // handleGetPaymentDetailForSeat(passed_user_details,1);
            })
            .catch((err) => {
                console.log("error qr code retrieval", err);
                if (err?.response?.status === 400) {
                    navigate("/error");
                }
            });
    };

    return (
        <>
            {currentUserDetailLoading ? (
                // true ?
                // <ErrorScreen /> :
                <LoadingScreen />
            ) : showModal ? (
                <div>
                    <Modal
                        open={open}
                        // onClose={handleClose}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div className='border border-sky-300 shadow rounded-md p-4 max-w-sm w-full sm:w-2/4 h-max mx-auto item-center margin_ bg-white'>
                            <h2 className='text-2xl font-bold text-center flex'>
                                <img
                                    src='https://media.licdn.com/dms/image/C510BAQF1CjF_d3HRlQ/company-logo_200_200/0/1630588309422/dowell_true_moments_living_lab_logo?e=2147483647&v=beta&t=ogSePm-Hfzu6Ng_21HyCOYUmaIZAJEdo83AKsUnQQVY'
                                    alt='Profile Photo'
                                    className='h-10 w-10 rounded-full shadow-5xl mx-2 border-solid border border-slate-100'
                                />
                                Setting up Q app for you
                            </h2>

                            {showContactAdministration.show ? (
                                <>
                                    <p className='text-center text-base font-semibold'>
                                        {showContactAdministration.message}
                                    </p>
                                </>
                            ) : (
                                <ul style={{ listStyleType: "none", padding: 0 }}>
                                    {API_URLS.map((stepData, index) => (
                                        <li
                                            key={index}
                                            style={{ display: "flex", alignItems: "center" }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                {index === 0 && loadingData.isMetaDbLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : index === 1 && loadingData.isDataDbLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : index === 2 && loadingData.isUserDetailsLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : index === 3 && loadingData.isSeatDataLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : index === 4 && loadingData.isQrCodeLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : index < step ? (
                                                    <CheckCircleIcon style={{ color: "green" }} />
                                                ) : null}
                                            </div>
                                            <div style={{ flex: 5 }} className='text-sm'>
                                                {stepData}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Modal>
                </div>
            ) : null
            }
        </>
    );
}

export default InitialConfigurationScreen;