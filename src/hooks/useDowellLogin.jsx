import { useSearchParams } from "react-router-dom";
import { useCurrentUserContext } from "../contexts/CurrentUserContext";
import { useEffect } from "react";
import { getUserInfoFromClientAdmin, getUserInfoFromLogin } from "../../services/loginServices";

const PRODUCT_LOGIN_URL = "https://100014.pythonanywhere.com/?redirect_url=" + window.location.origin + "/100116-q/%23";
const USER_KEY_IN_SESSION_STORAGE = 'q-user-detail';

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

export default function useDowellLogin() {
    const {
        setCurrentUser,
        setCurrentUserDetailLoading,
    } = useCurrentUserContext();
    const [ searchParams, setSearchParams ] = useSearchParams();

    useEffect(() => {
        const session_id = searchParams.get("session_id");
        const id = searchParams.get("id");
        const localUserDetails = getSavedLoggedInUser();

        if (localUserDetails) {
            setCurrentUser(localUserDetails);
            return
        }

        if (session_id) {
            setCurrentUserDetailLoading(true);

            if (id) {
                getUserInfoFromClientAdmin(session_id)
                .then((res) => {
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
            .then((res) => {
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

        // redirecting to login
        sessionStorage.clear();
        window.location.replace(PRODUCT_LOGIN_URL);

    }, [])
}