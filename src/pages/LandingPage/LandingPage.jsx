import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import { useCurrentUserContext } from '../../contexts/CurrentUserContext';
import { getApiKeyInfoFromClientAdmin } from '../../../services/loginServices';
import {
    getCheckMetaDatabaseStatus,
    getCheckDataDatabaseStatus,
    getUserDetails,
    createCollection,
    saveUserDetails,
    getStoreData,
    createStore,
    getQrCode,
    createQrCode,
} from '../../../services/qServices';
import {
    Button,
    CircularProgress,
    Modal,
    Snackbar,
    IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { formatDateForAPI } from '../../helpers/helpers';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const API_URLS = [
    "Getting Meta Data",
    "Getting Data Database",
    "Getting User Details",
    "Getting Store Data",
    "Getting QR Code Data",
];

const USER_DETAILS_IN_SESSION_STORAGE = 'q-user-new-details';

const workspace_id = '6385c0f18eca0fb652c94558';

const LandingPage = () => {
    const { currentUser } = useCurrentUserContext();
    const {
        currentUserDetailLoading,
        currentUserApiKey

    } = useCurrentUserContext();
    const [cardPagination, setCardPagination] = useState(0);
    const [cardIndex, setCardIndex] = useState(0);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(true);
    const [loadingData, setLoadingData] = useState({
        isMetaDbLoading: false,
        isDataDbLoading: false,
        isUserDetailsLoading: false,
        isSeatDataLoading: false,
        isQrCodeLoading: false,
    })
    const [showContactAdministration, setShowContactAdministration] = useState({
        show: false,
        message: '',
    });
    const [open, setOpen] = useState(true);
    const [step, setStep] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const currentDate = new Date();
    const [userDetails, setUserDetails] = useState([]);

    function createData(name, calories, fat, carbs, protein) {
        return { name, calories, fat, carbs, protein };
    }

    const rows = [
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),

    ];

    const incrementStepPagination = (steps, length) => {
        console.log(currentUser);
        if (steps + 1 <= 100) {
            if (steps + cardPagination !== 100) {
                setCardPagination(cardPagination + 5);
            }
        }
    };

    const decrementStepPagination = () => {
        if (cardPagination == 5) {
            setCardPagination(0);
        } else if (cardPagination > 5) {
            setCardPagination(cardPagination - 5);
        }
    };

    const handleInputChange = (event) => {
        let value = parseInt(event.target.value, 10);

        if (value > 99) {
            value = 99;
        } else if (value <= 0) {
            value = 1;
        } else {
            const newValue = event.key === 'ArrowUp' ? value + 1 : event.key === 'ArrowDown' ? Math.max(0, value - 1) : value;
            event.target.value = newValue;
        }

        event.target.value = value;
    };

    const handleAmountInputChange = (event) => {
        const currentValue = parseInt(event.target.value || '0', 10);

        if (event.nativeEvent.inputType === 'insertText') {
            const newValue = currentValue < 0 ? 0 : currentValue;
            event.target.value = newValue;
        } else if (currentValue <= 0) {
            event.target.value = 0;
        } else {
            const newValue = event.key === 'ArrowUp' ? currentValue + 1 : event.key === 'ArrowDown' ? Math.max(0, currentValue - 1) : currentValue;
            event.target.value = newValue;
        }

    }

    useEffect(() => {
        if (!currentUser || !currentUserApiKey) return;
        // currentUser?.userinfo?.client_admin_id
        console.log('curent userrrr>>>>>>>>>', currentUser);
        setLoadingData({ isMetaDbLoading: true, isDataDbLoading: false, isUserDetailsLoading: false, isSeatDataLoading: false, isQrCodeLoading: false });
        getCheckMetaDatabaseStatus(currentUser?.userinfo?.client_admin_id).then(res => {
            console.log('resssss', res);

            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isMetaDbLoading: false, isDataDbLoading: true }));
            //checking for data db response now 
            handleDataDatabaseStatus();
        }).catch(err => {
            console.log('status', err);
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isMetaDbLoading: false }));
            if (err?.response?.status === 501) {
                setShowContactAdministration({ show: true, message: err?.response?.data?.message })
            }
            if (err?.response?.status === 404) {
                console.log(err?.response?.data?.response);
                const promises = err?.response?.data?.response?.map(collection => {
                    const dataToPost = {
                        "workspace_id": currentUser?.userinfo?.client_admin_id,
                        "database_type": "META DATA",
                        "collection_name": collection,
                    }
                    return createCollection(dataToPost);
                })

                Promise.all(promises).then(() => { handleDataDatabaseStatus(); });
            }
        })

    }, [currentUser, currentUserApiKey])

    const handleDataDatabaseStatus = async () => {
        getCheckDataDatabaseStatus(currentUser?.userinfo?.client_admin_id, formatDateForAPI(currentDate)).then(res => {
            console.log('res get check data database status', res?.data);
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isDataDbLoading: false, isUserDetailsLoading: true }));
            //checking for User details
            handlegetUserDetails();
        }).catch(err => {
            console.log('error in data database api', err);
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isDataDbLoading: false }));

            if (err?.response?.status === 501) {
                setShowContactAdministration({ show: true, message: err?.response?.data?.message })
            }
            if (err?.response?.status === 404) {
                console.log(err?.response?.data?.response);
                const promises = err?.response?.data?.response?.map(collection => {
                    const dataToPost = {
                        "workspace_id": currentUser?.userinfo?.client_admin_id,
                        "database_type": "DATA",
                        "collection_name": collection,
                    }

                    return createCollection(dataToPost);
                })
                Promise.all(promises).then(() => { handlegetUserDetails(); });
            }
        })
    }

    const handlegetUserDetails = async () => {
        await getUserDetails(currentUser?.userinfo?.client_admin_id).then(res => {
            console.log(res);
        }).catch(err => {
            if (err?.response?.status === 302) {
                console.log('get user details resssss', err?.response?.data?.response);
                setUserDetails(err?.response?.data?.response);
                setLoadingData(prevLoadingData => ({ ...prevLoadingData, isUserDetailsLoading: false, isSeatDataLoading: true }));
                handleGetStoreData();
            }
            if (err?.response?.status === 404) {
                // setLoadingData(prevLoadingData => ({ ...prevLoadingData, isUserDetailsLoading: false }))
                handleSaveUserDetails();
            }
        })
    }

    const handleSaveUserDetails = async () => {
        const dataToPost = {
            "name": `${currentUser?.userinfo?.first_name} ${currentUser?.userinfo?.last_name}`,
            "email": currentUser?.userinfo?.email,
            "bank_details": {},
            "username": currentUser?.userinfo?.username,
            "workspace_id": currentUser?.userinfo?.client_admin_id,
            "timezone": currentUser?.userinfo?.timezone
        }

        await saveUserDetails(dataToPost).then(res => {
            console.log('res save user details', res);
            // setLoadingData(prevLoadingData => ({ ...prevLoadingData, isUserDetailsLoading: false, isSeatDataLoading: true }));
            handlegetUserDetails();
        }).catch(err => {
            console.log('err save user details', err);
            if (err?.response?.status === 404) { }
        })
    }

    const handleGetStoreData = async () => {
        console.log('1', userDetails);
        await getStoreData(currentUser?.userinfo?.client_admin_id).then(async (res) => {
            console.log('get store data', res);
            if (res?.data?.response?.length === 0) {
                const store_ids = userDetails[0].store_ids;

                const promises = store_ids.map((store) => {
                    const dataToPost = {
                        "store_id": store,
                        "workspace_id": currentUser?.userinfo?.client_admin_id,
                        "user_id": userDetails[0]?._id,
                        "timezone": currentUser?.userinfo?.timezone
                    }
                    return createStore(dataToPost);
                })
                // console.log('promises', promises);
                await Promise.all(promises).then(() => { console.log('store created') }).catch(() => { console.log('unable to create store') })
            }
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isSeatDataLoading: false, isQrCodeLoading: true }));
            handleGetQrCode();
        }).catch(err => {
            console.log('err get store data', err);
        })
    }

    const handleGetQrCode = async () => {
        // const _userId = a userDetails;
        console.log('2', userDetails);
        await getQrCode(currentUser?.userinfo?.client_admin_id, userDetails[0]?._id).then(async (res) => {
            console.log('qr code resssss', res);
            // if (res?.data?.response?.length === 0) {
            //     const seatNumbers = [1, 2, 3, 4, 5];
            //     const dataToPost = {
            //         "link": "https://xvr8nq-5173.csb.app/",
            //         "timezone": currentUser?.userinfo?.timezone,
            //         "username": currentUser?.userinfo?.username,
            //     }
            //     const promises = seatNumbers.map((index) => {
            //         return createQrCode(currentUser?.userinfo?.client_admin_id, userDetails[0]?._id, index, dataToPost)
            //     })
            //     console.log('createqr code', promises);
            //     await Promise.all(promises);
            // }
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isQrCodeLoading: false }));
            setShowModal(false);
        }).catch(err => {
            console.log('error qr code retrieval', err);
        })
    }

    return (
        <>
            {
                (
                    currentUserDetailLoading ?
                        // true ?
                        <LoadingScreen /> :
                        showModal ? (
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
                                    <div
                                        style={{
                                            width: 'max-content',
                                            backgroundColor: "white",
                                            padding: '1%',
                                            borderRadius: 8,
                                            fontFamily: "Arial, sans-serif",
                                            fontSize: 16,
                                        }}
                                    >
                                        <h2 className="text-2xl font-bold text-center">Setting up Q app for you</h2>

                                        {
                                            showContactAdministration.show ?
                                                <>
                                                    <p>{showContactAdministration.message}</p>
                                                </>
                                                :
                                                <ul style={{ listStyleType: "none", padding: 0 }}>
                                                    {
                                                        API_URLS.map((stepData, index) => (
                                                            <li key={index} style={{ display: "flex", alignItems: "center" }}>
                                                                <div style={{ flex: 1 }}>
                                                                    {
                                                                        index === 0 && loadingData.isMetaDbLoading ? (
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
                                                                        ) : null
                                                                    }
                                                                </div>
                                                                <div style={{ flex: 5 }}>{stepData}</div>
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                        }
                                    </div>
                                </Modal>
                                {/* <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={6000}
                            onClose={handleSnackbarClose}
                            message={snackbarMessage}
                        /> */}
                            </div>
                        )
                            :
                            (<div className="h-screen m-0 p-0 gradient_ flex items-baseline">
                                <div className="w-full h-full bg-white margin_ shadow-black mt-3.5 p-4 pt-2 pb-6 rounded-md md:w-11/12 md:h-max">
                                    <div className="h-24 border-b-2 border-zinc-400 m-2 flex items-center justify-between">
                                        <img
                                            src="https://media.licdn.com/dms/image/C510BAQF1CjF_d3HRlQ/company-logo_200_200/0/1630588309422/dowell_true_moments_living_lab_logo?e=2147483647&v=beta&t=ogSePm-Hfzu6Ng_21HyCOYUmaIZAJEdo83AKsUnQQVY"
                                            alt="Dowell Logo"
                                            className="h-5/6 shadow-2xl mx-8"
                                        />
                                        <p className="text-5xl font-bold">Q</p>
                                        <img
                                            src="https://i.pinimg.com/736x/f8/66/8e/f8668e5328cfb4938903406948383cf6.jpg"
                                            alt="Profile Photo"
                                            className="h-10 w-10 rounded-full shadow-2xl mx-10 cursor-pointer"
                                            onClick={() => navigate('/profile')}
                                        />
                                    </div>
                                    <div className="flex h-[50%] items-center sm:h-[325px]">
                                        <div className=" flex flex-col h-full w-full py-8 shadow-2xl sm:flex-row">
                                            <TableContainer component={Paper} style={{ width: '98%' }}>
                                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="center">No.</TableCell>
                                                            <TableCell align="center">Seat Number</TableCell>
                                                            <TableCell align="center">Create Payment Request</TableCell>
                                                            <TableCell align="left">Payment Requests</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {rows.slice(cardPagination, cardPagination + 5).map((row, index) => (
                                                            <TableRow key={index + '_'}>
                                                                <TableCell component="th" scope="row" align="center">
                                                                    {index + cardPagination + 1}
                                                                </TableCell>
                                                                {/* <TableCell align="center">{row.name}</TableCell> */}
                                                                <TableCell align="center">{row.calories}</TableCell>
                                                                <TableCell align="center">{row.fat}</TableCell>
                                                                <TableCell align="left">{row.carbs}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <div className="w-full m-2 flex items-center justify-center sm:w-1/6 sm:m-0">
                                                <div className="flex items-center rotate-0 sm:rotate-90">
                                                    <button
                                                        className="cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-9 h-9"
                                                        onClick={() =>
                                                            decrementStepPagination()
                                                        }
                                                    >
                                                        <IoIosArrowBack />
                                                    </button>
                                                    {
                                                        createArrayWithLength(100)
                                                            .slice(
                                                                cardPagination,
                                                                cardPagination + 5
                                                            )
                                                            .map((s, index) => (
                                                                <div className="rotate-0 sm:rotate-90">
                                                                    <button
                                                                        className="rotate-0 bg-inherit text-black border-solid border border-sky-500 rounded-full m-0.5 w-9 h-9 sm:rotate-180"
                                                                        onClick={() => {
                                                                            setCardIndex(index);
                                                                        }}
                                                                        key={`${s}_button`}
                                                                    >
                                                                        {s + 1}
                                                                    </button>
                                                                </div>
                                                            ))
                                                    }
                                                    <button
                                                        className="cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-9 h-9"
                                                        onClick={() =>
                                                            incrementStepPagination(5, 100 / 5)
                                                        }
                                                    >
                                                        <IoIosArrowForward />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-20 flex items-center justify-center py-6 m-6">
                                        <p className="text-sm mx-1 sm:text-lg sm:mx-4">Seat Number:</p>
                                        <input
                                            type='number'
                                            className="cursor-pointer p-0 text-4xl bg-inherit m-0 border-solid border border-sky-500 rounded w-20 focus:outline-none sm:text-5xl sm:border-none sm:m-2 sm:p-1 sm:w-28"
                                            min="1"
                                            max="99"
                                            onInput={handleInputChange}
                                        ></input>
                                        <p className="text-sm mx-1 sm:text-lg sm:mx-4">Amount:</p>
                                        <input
                                            type='number'
                                            className="cursor-pointer p-0 bg-inherit text-4xl border-solid border border-sky-500 m-0 rounded w-20 focus:outline-none sm:text-5xl sm:w-44 sm:border-none sm:m-2 sm:p1 sm:w-28"
                                            onChange={handleAmountInputChange}
                                        ></input>
                                        <button class="cursor-pointer flex items-center justify-center bg-white hover:bg-green-100 text-gray-800 font-semibold py-2 px-4 border border-green-400 rounded shadow m-2">Enter<IoArrowForwardCircleSharp className="mx-2 text-xl" /></button>
                                    </div>
                                    <div className="flex flex-col m-1 items-center justify-center m-4 sm:flex-row sm:m-6">
                                        <button class="cursor-pointer bg-white hover:bg-orange-100 text-gray-800 font-semibold py-2 px-4 border border-orange-400 rounded shadow m-2">Close Seat/Service Desk</button>
                                        <button class="cursor-pointer bg-white hover:bg-sky-100 text-gray-800 font-semibold py-2 px-4 border border-sky-400 rounded shadow m-2">Start Service to Selected Seat/Desk</button>
                                        <button class="cursor-pointer flex items-center justify-between bg-white hover:bg-rose-100 text-gray-800 font-semibold py-2 px-4 border border-rose-600 rounded shadow m-2"><CiLogout className="mx-2 text-xl" />Logout</button>
                                    </div>
                                </div>
                            </div >
                            )
                )
            }
        </>
    )
}
export default LandingPage;

export function createArrayWithLength(length) {
    return Array.from({ length }, (_, index) => index);
}