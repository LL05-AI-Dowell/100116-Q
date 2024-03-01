import PropTypes from "prop-types";
import { createContext, useContext, useState } from "react";

const UserContext = createContext({});

export const useCurrentUserContext = () => useContext(UserContext);

const UserContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserDetailLoading, setCurrentUserDetailLoading] = useState(false);
    const [currentUserApiKey, setCurrentUserApiKey] = useState(null);
    const [qUserDetails, setQUserDetails] = useState(null);

    return <>
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                currentUserDetailLoading,
                setCurrentUserDetailLoading,
                currentUserApiKey,
                setCurrentUserApiKey,
                qUserDetails,
                setQUserDetails,
            }}
        >
            {children}
        </UserContext.Provider>
    </>
}

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export default UserContextProvider;