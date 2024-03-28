import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useState, useEffect, useRef } from 'react';
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
    getPaymentDetailForSeat,
    getQrCodeIdBySeatNumber,
    createCustomerPayment
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
import { NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE, getSavedNewUserDetails } from '../../hooks/useDowellLogin';
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import SeatRow from './TableContent';
import { data } from 'autoprefixer';
import ErrorScreen from '../ErrorScreen/ErrorScreen';
import { IoWarningOutline } from "react-icons/io5";
import DigitalQLogo from '../../assets/Digital_Q.svg'

const API_URLS = [
    "You're almost ready to use the app!",
    "Setting up the 'Q' app.",
    "We're currently configuring user information.",
    "We're currently updating store details.",
    "We're currently arranging seating.",
];


const workspace_id = '6385c0f18eca0fb652c94558';

const LandingPage = () => {
    const queryClient = new QueryClient();
    // const {  } = useCurrentUserContext();
    const {
        currentUser,
        currentUserDetailLoading,
        currentUserApiKey,
        intialConfigurationLoaded,
        setIntialConfigurationLoaded,
        qrCodeResponse,
        setQrCodeResponse
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
    const currentDate = new Date();
    const [userDetails, setUserDetails] = useState([]);
    const [showBanner, setShowBanner] = useState(false);
    const [qrCodeIdForSeatNumber, setQrCodeIdForSeatNumber] = useState({
        seatNumber: null,
        qrCodeId: null,
        amount: null,
    });
    const [enterPaymentRecordLoading, setEnterPaymentRecordLoading] = useState(false);
    const [seatNumber, setSeatNumber] = useState(null);
    const [amountEntered, setAmountEntered] = useState(null);
    const [showActivateSeat, setShowActivateSeat] = useState(false);
    const seatNumberRef = useRef(null);
    const amountRef = useRef(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (seatNumberRef.current) {
                seatNumberRef.current.focus();
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [qrCodeResponse]);

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

    const handleInputChange = async (event) => {
        setShowActivateSeat(false);
        let value = parseInt(event.target.value, 10);

        // if (event.key === 'Enter') {
        //     amountRef.current.focus();
        //     return;
        // }

        if (value > 99) {
            value = 99;
        } else if (value <= 0) {
            value = 1;
        } else {
            const newValue = event.key === 'ArrowUp' ? value + 1 : event.key === 'ArrowDown' ? Math.max(0, value - 1) : value;
            event.target.value = newValue;
            setSeatNumber(newValue);
        }
        setSeatNumber(value);
        event.target.value = value;

        await getQrCodeIdBySeatNumber(currentUser?.userinfo?.client_admin_id, value).then(res => {
            console.log('res get qr code id by seat', res?.data?.response);
            setQrCodeIdForSeatNumber(prevVal => ({ ...prevVal, qrCodeId: res?.data?.response, seatNumber: value }));
        }).catch(err => {
            console.log('err get qr code id by seat no', err);
            if (err?.response?.status === 400) {
                setShowActivateSeat(true);
            }
        })
    };

    const handleAmountInputChange = (event) => {
        const currentValue = parseInt(event.target.value || '0', 10);

        if (event.nativeEvent.inputType === 'insertText') {
            const newValue = currentValue < 0 ? 0 : currentValue;
            event.target.value = newValue;
            setAmountEntered(newValue);
        } else if (currentValue <= 0) {
            event.target.value = 0;
            setAmountEntered(0);
        } else {
            const newValue = event.key === 'ArrowUp' ? currentValue + 1 : event.key === 'ArrowDown' ? Math.max(0, currentValue - 1) : currentValue;
            event.target.value = newValue;
            setAmountEntered(newValue);
        }
        setQrCodeIdForSeatNumber(prevVal => ({ ...prevVal, amount: Number(event.target.value) }));
    }

    useEffect(() => {
        if (!currentUser || !currentUserApiKey) return;
        // currentUser?.userinfo?.client_admin_id
        console.log('curent userrrr>>>>>>>>>', currentUser);
        if (intialConfigurationLoaded === true) return setShowModal(false);
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
            if (err?.response?.status === 400) {
                navigate('/error');
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
                Promise.all(promises).then(() => { handlegetUserDetails(); }).catch(() => {
                    if (err?.response?.status === 400) {
                        navigate('/error');
                    }
                })
            }
            if (err?.response?.status === 400) {
                navigate('/error');
            }
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isDataDbLoading: false, isUserDetailsLoading: true }));
        })
    }

    const handlegetUserDetails = async () => {
        await getUserDetails(currentUser?.userinfo?.client_admin_id).then(res => {
            console.log(res);
        }).catch(err => {
            if (err?.response?.status === 302) {
                console.log('get user details resssss', err?.response?.data?.response);
                setUserDetails(err?.response?.data?.response);
                sessionStorage.setItem(NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE, JSON.stringify(err?.response?.data?.response))
                setLoadingData(prevLoadingData => ({ ...prevLoadingData, isUserDetailsLoading: false, isSeatDataLoading: true }));
                handleGetStoreData(err?.response?.data?.response);
            }
            if (err?.response?.status === 404) {
                // setLoadingData(prevLoadingData => ({ ...prevLoadingData, isUserDetailsLoading: false }))
                handleSaveUserDetails();
            }
            if (err?.response?.status === 400) {
                navigate('/error');
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
            if (err?.response?.status === 400) {
                navigate('/error');
            }
        })
    }

    const handleGetStoreData = async (passed_user_details) => {
        console.log('1', passed_user_details);
        await getStoreData(currentUser?.userinfo?.client_admin_id).then(async (res) => {
            console.log('get store data', res);
            if (res?.data?.response?.length === 0) {
                const store_ids = passed_user_details[0].store_ids;

                const promises = store_ids.map((store) => {
                    const dataToPost = {
                        "store_id": store,
                        "workspace_id": currentUser?.userinfo?.client_admin_id,
                        "user_id": passed_user_details[0]?._id,
                        "timezone": currentUser?.userinfo?.timezone
                    }
                    return createStore(dataToPost);
                })
                // console.log('promises', promises);
                await Promise.all(promises).then(() => { console.log('store created') }).catch(() => {
                    if (err?.response?.status === 400) {
                        navigate('/error');
                    }
                })
            }
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isSeatDataLoading: false, isQrCodeLoading: true }));
            handleGetQrCode(passed_user_details);
        }).catch(err => {
            console.log('err get store data', err);
            if (err?.response?.status === 400) {
                navigate('/error');
            }
        })
    }

    const handleGetQrCode = async (passed_user_details) => {
        // const _userId = a userDetails;
        console.log('2', passed_user_details);
        await getQrCode(currentUser?.userinfo?.client_admin_id, passed_user_details[0]?._id).then(async (res) => {
            console.log('qr code resssss', res);
            if (res?.data?.response?.length === 0) {
                setShowBanner(true);
            }
            setLoadingData(prevLoadingData => ({ ...prevLoadingData, isQrCodeLoading: false }));
            setShowModal(false);
            setQrCodeResponse(res?.data?.response);
            setIntialConfigurationLoaded(true);
            // handleGetPaymentDetailForSeat(passed_user_details,1);
        }).catch(err => {
            console.log('error qr code retrieval', err);
            if (err?.response?.status === 400) {
                navigate('/error');
            }
        })
    }


    const handleGetPaymentDetailForSeat = async (passed_user_details, seat_no) => {
        const dataToPost = {
            "timezone": currentUser?.userinfo?.timezone,
        }
        console.log(getSavedNewUserDetails());
        // await getPaymentDetailForSeat(currentUser?.userinfo?.client_admin_id, seat_no, formatDateForAPI(currentDate), passed_user_details[0]?.store_ids[0]).then(res => {
        //     console.log('getting payment details for seat', res);
        // }).catch(err => {
        //     console.log('err getting payment details for seat', err);
        // })
    }

    const handleEnterDataClick = async () => {
        setEnterPaymentRecordLoading(true);
        const dataToPost = {
            "workspace_id": currentUser?.userinfo?.client_admin_id,
            "qrcode_id": qrCodeIdForSeatNumber?.qrCodeId,
            "date": formatDateForAPI(currentDate),
            "timezone": currentUser?.userinfo?.timezone,
            "seat_number": qrCodeIdForSeatNumber?.seatNumber,
            "store_id": getSavedNewUserDetails()[0].store_ids[0],
            "amount": qrCodeIdForSeatNumber?.amount
        }
        // console.log(dataToPost)
        await createCustomerPayment(dataToPost).then(res => {
            setEnterPaymentRecordLoading(false);
            console.log('createCustomerPayment resss', res);
            setSeatNumber('');
            setAmountEntered('');
        }).catch(err => {
            setEnterPaymentRecordLoading(false);
            console.log('err createCustomerPayment', err);
            if (err?.response?.status === 400) {
                navigate('/error');
            }
        })
    }

    return (
        <>
            {
                (
                    currentUserDetailLoading ?
                        // true ?
                        // <ErrorScreen /> :
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
                                    <div className="border border-sky-300 shadow rounded-md p-4 max-w-sm w-full sm:w-2/4 h-max mx-auto item-center margin_ bg-white">
                                        <h2 className="text-2xl font-bold text-center flex">
                                            <img
                                                src="https://media.licdn.com/dms/image/C510BAQF1CjF_d3HRlQ/company-logo_200_200/0/1630588309422/dowell_true_moments_living_lab_logo?e=2147483647&v=beta&t=ogSePm-Hfzu6Ng_21HyCOYUmaIZAJEdo83AKsUnQQVY"
                                                alt="Profile Photo"
                                                className="h-10 w-10 rounded-full shadow-5xl mx-2 border-solid border border-slate-100"
                                            />
                                            Setting up Q app for you</h2>

                                        {
                                            showContactAdministration.show ?
                                                <>
                                                    <p className='text-center text-base font-semibold'>{showContactAdministration.message}</p>
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
                                                                <div style={{ flex: 5 }} className="text-sm">{stepData}</div>
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
                            (
                                <div className="h-screen m-0 p-0 gradient_ flex items-baseline">
                                    <div className="w-full h-full bg-white margin_ shadow-black mt-3.5 p-4 pt-2 pb-6 rounded-md md:w-11/12 md:h-max">
                                        {
                                            showBanner ? <p className="text-rose-900 text-2xl text-center">Have you created a seat yet, No? <button className='cursor-pointer bg-white text-xl hover:bg-orange-100 text-gray-800 font-semibold py-1 px-2 border border-orange-400 rounded shadow m-2'
                                                onClick={() => navigate('/profile')}>Create One</button></p> : null
                                        }
                                        <div className="h-24 border-b-2 border-zinc-400 m-2 flex items-center justify-between">
                                            <img
                                                src={DigitalQLogo}
                                                // src=''
                                                alt="Dowell Logo"
                                                className="h-5/6 shadow-2xl mx-8"
                                            />
                                            {/* <p className="text-5xl font-bold">Q</p> */}
                                            <div className="flex items-center justify-center">
                                                <img
                                                    src="https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg"
                                                    alt="Profile Photo"
                                                    className="h-10 w-10 rounded-full shadow-2xl cursor-pointer"
                                                    onClick={() => navigate('/profile')}
                                                />
                                                <button className="cursor-pointer flex items-center justify-between bg-white hover:bg-rose-100 text-gray-800 font-semibold py-2 px-2 border border-rose-600 rounded shadow mx-4"><CiLogout className="mx-1 text-xl" />Logout</button>
                                            </div>
                                        </div>
                                        {
                                            showActivateSeat ? <div className="border border-orange-400 bg-orange-50 w-max rounded margin_ flex items-center justify-center p-2">
                                                <IoWarningOutline color='#fb923c' fontSize={'1.3rem'} />
                                                <p className="text-stone-600 text-lg text-center mx-2">Selected seat is not active...</p>
                                            </div> : null
                                        }
                                        <div className="flex h-[50%] items-center sm:h-[325px] my-4">
                                            <div className="flex flex-col justify-between h-full w-full py-8 shadow-2xl sm:flex-row">
                                                <QueryClientProvider client={queryClient}>
                                                    <TableContainer component={Paper} sx={{ width: '98%', height: 'max-content' }}>
                                                        <Table sx={{ minWidth: '100%' }} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell sx={{ width: 'max-content', padding: '1%', fontWeight: '600' }} align="center" >Seat Number</TableCell>
                                                                    <TableCell sx={{ width: 'max-content', padding: '1%', fontWeight: '600' }} align="center">Payment Requested</TableCell>
                                                                    <TableCell sx={{ width: 'max-content', padding: '1%', fontWeight: '600' }} align="left">Payment Status</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {qrCodeResponse.slice(cardPagination, cardPagination + 5).map((row, index) => (
                                                                    <TableRow key={index + '_'}>
                                                                        <SeatRow key={index} seatNumber={index} pagination={cardPagination} />
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </QueryClientProvider>
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
                                        <div className="w-full h-20 flex items-center justify-center py-6 my-12">
                                            <p className="text-sm mx-1 sm:text-lg sm:mx-4">Seat Number:</p>
                                            <input
                                                type='number'
                                                className="cursor-pointer p-0 text-4xl bg-inherit m-0 border-solid border border-sky-500 rounded w-20 focus:outline-none sm:text-6xl sm:border-none sm:m-2 sm:p-1 sm:w-28"
                                                min="1"
                                                max="99"
                                                value={seatNumber}
                                                onChange={(event) => handleInputChange(event)}
                                                ref={seatNumberRef}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        if (seatNumber) {
                                                            amountRef.current.focus();
                                                        }
                                                    }
                                                }}
                                            ></input>
                                            <p className="text-sm mx-1 sm:text-lg sm:mx-4">Amount:</p>
                                            <input
                                                ref={amountRef}
                                                value={amountEntered}
                                                type='number'
                                                className="cursor-pointer p-0 bg-inherit text-4xl border-solid border border-sky-500 m-0 rounded w-20 focus:outline-none sm:text-6xl sm:w-44 sm:border-none sm:m-2 sm:p1 sm:w-28"
                                                onChange={(event) => handleAmountInputChange(event)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        if (amountEntered) {
                                                            handleEnterDataClick();
                                                        }
                                                    }
                                                }}
                                            ></input>
                                            <button className="cursor-pointer flex items-center justify-center bg-white hover:bg-green-100 text-gray-800 font-semibold py-2 px-4 border border-green-400 rounded shadow m-2"
                                                onClick={handleEnterDataClick}
                                            >
                                                {enterPaymentRecordLoading ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <>
                                                        Enter <IoArrowForwardCircleSharp className="mx-2 text-xl" />
                                                    </>
                                                )}

                                            </button>
                                        </div>
                                        {/* <div className="flex flex-col m-1 items-center justify-center m-4 sm:flex-row sm:m-6">
                                            <button class="cursor-pointer bg-white hover:bg-orange-100 text-gray-800 font-semibold py-2 px-4 border border-orange-400 rounded shadow m-2">Close Seat/Service Desk</button>
                                            <button class="cursor-pointer bg-white hover:bg-sky-100 text-gray-800 font-semibold py-2 px-4 border border-sky-400 rounded shadow m-2">Start Service to Selected Seat/Desk</button>
                                        </div> */}
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