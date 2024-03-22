import { useLocation, useSearchParams } from "react-router-dom";
import { useCurrentUserContext } from "../contexts/CurrentUserContext";
import { useEffect } from "react";
import { getUserInfoFromClientAdmin, getUserInfoFromLogin, getApiKeyInfoFromClientAdmin } from "../../services/loginServices";

const PRODUCT_LOGIN_URL = "https://100014.pythonanywhere.com/?redirect_url=" + window.location.origin
const USER_KEY_IN_SESSION_STORAGE = 'q-user-detail';
const API_KEY_IN_SESSION_STORAGE = 'q-api-key';
export const NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE = 'q-new-user-details';

const getSavedLoggedInUser = () => {
    let userDetails;

    try {
        userDetails = JSON.parse(
            sessionStorage.getItem(USER_KEY_IN_SESSION_STORAGE)
        );
    } catch (error) {
        console.log("no saved user");
    }

    return userDetails;
};

export const getSavedNewUserDetails = () => {
    let userDetails;

    try {
        userDetails = JSON.parse(
            sessionStorage.getItem(NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE)
        );
    } catch (error) {
        console.log("no saved user");
    }

    return userDetails;
};

export const getSavedApiKey = () => {
    let savedApiKey;

    savedApiKey = sessionStorage.getItem(API_KEY_IN_SESSION_STORAGE);

    return savedApiKey;
}

export default function useDowellLogin() {
    const {
        setCurrentUser,
        setCurrentUserDetailLoading,
        setCurrentUserApiKey
    } = useCurrentUserContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const { pathname } = useLocation()

    useEffect(() => {
        const session_id = searchParams.get("session_id");
        const id = searchParams.get("id");
        const view = searchParams.get("view");
        const localUserDetails = getSavedLoggedInUser();
        const localAPIKey = getSavedApiKey();
        const isSuccessScreen = view === 'success'
        const isqrCodeScreen = (pathname === '/qrlink' || pathname === '/qrlink/')

        if (localAPIKey) {
            setCurrentUserApiKey(localAPIKey);
        } else {
            getApiKeyInfoFromClientAdmin(localUserDetails?.userinfo?.client_admin_id).then(res => {
                setCurrentUserApiKey(res?.data?.data?.api_key);
            }).catch(err => {
                console.log('err while fetching api key', err);
            })
        }

        if (localUserDetails) {
            setCurrentUser(localUserDetails);
            return
        }

        if (session_id) {
            setCurrentUserDetailLoading(true);

            if (id) {
                getUserInfoFromClientAdmin(session_id)
                    .then(async (res) => {
                        try {
                            const apiKeyRes = (await getApiKeyInfoFromClientAdmin(res.data?.userinfo?.client_admin_id)).data;
                            setCurrentUserApiKey(apiKeyRes?.data?.api_key);

                            sessionStorage.setItem(
                                API_KEY_IN_SESSION_STORAGE, // define and store it in session also
                                apiKeyRes?.data?.api_key, // no stringifying because it's a string
                            );
                        } catch (error) {
                            console.log('err while fetching api key', error);
                        }

                        setCurrentUser(res.data);
                        setCurrentUserDetailLoading(false);

                        sessionStorage.setItem(
                            USER_KEY_IN_SESSION_STORAGE,
                            JSON.stringify(res.data)
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                        setCurrentUserDetailLoading(false);
                    });

                return;
            }

            getUserInfoFromLogin(session_id)
                .then(async (res) => {
                    try {
                        const apiKeyRes = (await getApiKeyInfoFromClientAdmin(res.data?.userinfo?.client_admin_id)).data;
                        setCurrentUserApiKey(apiKeyRes?.data?.api_key);

                        sessionStorage.setItem(
                            API_KEY_IN_SESSION_STORAGE, // define and store it in session also
                            apiKeyRes?.data?.api_key, // no stringifying because it's a string
                        );
                    } catch (error) {
                        console.log('err while fetching api key', error);
                    }

                    setCurrentUser(res.data);
                    setCurrentUserDetailLoading(false);

                    sessionStorage.setItem(
                        USER_KEY_IN_SESSION_STORAGE,
                        JSON.stringify(res.data)
                    );
                })
                .catch((err) => {
                    console.log(err);
                    setCurrentUserDetailLoading(false);
                });


            return
        }
        if (isSuccessScreen) return
        if (isqrCodeScreen) return
        // redirecting to login
        sessionStorage.clear();
        window.location.replace(PRODUCT_LOGIN_URL);

    }, [])
}