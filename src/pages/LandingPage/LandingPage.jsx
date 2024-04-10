import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState, useEffect, useRef } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { getApiKeyInfoFromClientAdmin } from "../../../services/loginServices";
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
  createCustomerPayment,
  getQrCodeOffline,
  getQrCodeOnline,
  retrieveMasterQr,
} from "../../../services/qServices";
import {
  Button,
  CircularProgress,
  Modal,
  Snackbar,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { formatDateForAPI } from "../../helpers/helpers";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import {
  NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE,
  getSavedNewUserDetails,
} from "../../hooks/useDowellLogin";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import SeatRow from "./TableContent";
import { data } from "autoprefixer";
import ErrorScreen from "../ErrorScreen/ErrorScreen";
import { IoWarningOutline } from "react-icons/io5";
import DigitalQLogo from "../../assets/Digital_Q.svg";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { CiShop } from "react-icons/ci";
import { MdCancel } from "react-icons/md";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";

const API_URLS = [
  "You're almost ready to use the app!",
  "Setting up the 'Q' app.",
  "We're currently configuring user information.",
  "We're currently updating store details.",
  "We're currently arranging seating.",
];

const workspace_id = "6385c0f18eca0fb652c94558";
const user_id = "660d7c78bdbc0038f13e0b2d";

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
    setQrCodeResponse,
  } = useCurrentUserContext();
  const [cardPagination, setCardPagination] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loadingData, setLoadingData] = useState({
    isMetaDbLoading: false,
    isDataDbLoading: false,
    isUserDetailsLoading: false,
    isSeatDataLoading: false,
    isQrCodeLoading: false,
  });
  const [showContactAdministration, setShowContactAdministration] = useState({
    show: false,
    message: "",
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
  const [enterPaymentRecordLoading, setEnterPaymentRecordLoading] =
    useState(false);
  const [seatNumber, setSeatNumber] = useState(null);
  const [amountEntered, setAmountEntered] = useState(null);
  const [showActivateSeat, setShowActivateSeat] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const [expandedChatId, setExpandedChatId] = useState(null);
  const seatNumberRef = useRef(null);
  const amountRef = useRef(null);

  // ------------------------calculator--------------------
  const [orderInitiatedForSeat, setOrderInitiatedForSeat] = useState([]);
  const [seatPagination, setSeatPagination] = useState(0);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderInitiatedId, setOrderInitiatedId] = useState("");
  const [retrievingOrders, setRetrievingOrders] = useState(false);
  const [tableEntered, setTableEntered] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isTicketLink, setIsTicketLink] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [onlineQr, setOnlineQr] = useState(false);
  const [retrivedMasterQrCode, setRetrivedMasterQrCode] = useState(false);

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

  const decrementSeatPagination = () => {
    if (seatPagination == 5) {
      setSeatPagination(0);
    } else if (seatPagination > 5) {
      setSeatPagination(seatPagination - 5);
    }
  };

  const incrementSeatPagination = (steps, length) => {
    console.log(currentUser);
    if (steps + 1 <= 100) {
      if (steps + seatPagination !== 100) {
        setSeatPagination(seatPagination + 5);
      }
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
      const newValue =
        event.key === "ArrowUp"
          ? value + 1
          : event.key === "ArrowDown"
          ? Math.max(0, value - 1)
          : value;
      event.target.value = newValue;
      setSeatNumber(newValue);
    }
    setSeatNumber(value);
    event.target.value = value;

    await getQrCodeIdBySeatNumber(currentUser?.userinfo?.client_admin_id, value)
      .then((res) => {
        console.log("res get qr code id by seat", res?.data?.response);
        setQrCodeIdForSeatNumber((prevVal) => ({
          ...prevVal,
          qrCodeId: res?.data?.response,
          seatNumber: value,
        }));
      })
      .catch((err) => {
        console.log("err get qr code id by seat no", err);
        if (err?.response?.status === 400) {
          setShowActivateSeat(true);
        }
      });
  };

  const handleAmountInputChange = (event) => {
    const currentValue = parseInt(event.target.value || "0", 10);

    if (event.nativeEvent.inputType === "insertText") {
      const newValue = currentValue < 0 ? 0 : currentValue;
      event.target.value = newValue;
      setAmountEntered(newValue);
    } else if (currentValue <= 0) {
      event.target.value = 0;
      setAmountEntered(0);
    } else {
      const newValue =
        event.key === "ArrowUp"
          ? currentValue + 1
          : event.key === "ArrowDown"
          ? Math.max(0, currentValue - 1)
          : currentValue;
      event.target.value = newValue;
      setAmountEntered(newValue);
    }
    setQrCodeIdForSeatNumber((prevVal) => ({
      ...prevVal,
      amount: Number(event.target.value),
    }));
  };

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
        console.log(res);
      })
      .catch((err) => {
        if (err?.response?.status === 302) {
          console.log(
            "get user details resssss",
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
    console.log("1", passed_user_details);
    await getStoreData(currentUser?.userinfo?.client_admin_id)
      .then(async (res) => {
        console.log("get store data", res);
        if (res?.data?.response?.length === 0) {
          const store_ids = passed_user_details[0].store_ids;

          const promises = store_ids.map((store) => {
            const dataToPost = {
              store_id: store,
              workspace_id: currentUser?.userinfo?.client_admin_id,
              user_id: passed_user_details[0]?._id,
              timezone: currentUser?.userinfo?.timezone,
            };
            return createStore(dataToPost);
          });
          // console.log('promises', promises);
          await Promise.all(promises)
            .then(() => {
              console.log("store created");
            })
            .catch(() => {
              if (err?.response?.status === 400) {
                navigate("/error");
              }
            });
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
        // handleGetPaymentDetailForSeat(passed_user_details,1);
      })
      .catch((err) => {
        console.log("error qr code retrieval", err);
        if (err?.response?.status === 400) {
          navigate("/error");
        }
      });
  };

  const handleGetPaymentDetailForSeat = async (
    passed_user_details,
    seat_no
  ) => {
    const dataToPost = {
      timezone: currentUser?.userinfo?.timezone,
    };
    console.log(getSavedNewUserDetails());
    // await getPaymentDetailForSeat(currentUser?.userinfo?.client_admin_id, seat_no, formatDateForAPI(currentDate), passed_user_details[0]?.store_ids[0]).then(res => {
    //     console.log('getting payment details for seat', res);
    // }).catch(err => {
    //     console.log('err getting payment details for seat', err);
    // })
  };

  const handleEnterDataClick = async () => {
    setEnterPaymentRecordLoading(true);
    const dataToPost = {
      workspace_id: currentUser?.userinfo?.client_admin_id,
      qrcode_id: qrCodeIdForSeatNumber?.qrCodeId,
      date: formatDateForAPI(currentDate),
      timezone: currentUser?.userinfo?.timezone,
      seat_number: qrCodeIdForSeatNumber?.seatNumber,
      store_id: getSavedNewUserDetails()[0].store_ids[0],
      amount: qrCodeIdForSeatNumber?.amount,
    };
    // console.log(dataToPost)
    await createCustomerPayment(dataToPost)
      .then((res) => {
        setEnterPaymentRecordLoading(false);
        console.log("createCustomerPayment resss", res);
        setSeatNumber("");
        setAmountEntered("");
      })
      .catch((err) => {
        setEnterPaymentRecordLoading(false);
        console.log("err createCustomerPayment", err);
        if (err?.response?.status === 400) {
          navigate("/error");
        }
      });
  };

  // console.debug("isTicketLink", isTicketLink);
  // console.debug("isPaid", isPaid);
  // console.debug("isActive", isActive);
  // console.debug("OfflineQr", OfflineQr);
  // console.debug("onlineQr", onlineQr);
  // console.debug("retrivedMasterQrCode", retrivedMasterQrCode);

  useEffect(() => {
    const getUserDetailsFunc = async () => {
      await getUserDetails(workspace_id)
        .then((res) => {
          console.log(res.status);
        })
        .catch((err) => {
          if (err?.response?.status === 302) {
            if (err?.data?.response.ticket_link === "") {
              setIsTicketLink(false);
            } else {
              setIsTicketLink(true);
            }

            if (err?.data?.response.is_paid === false) {
              setIsPaid(true);
            } else {
              setIsPaid(false);
            }

            if (err?.data?.response.is_active) {
              setIsActive(false);
            } else {
              setIsActive(true);
            }
          }
          if (err?.response?.status === 404) {
            console.log(err.message);
          }
          if (err?.response?.status === 400) {
            console.log(err.message);
          }
        });
    };

    const getUserQrcodeOnline = async () => {
      await getQrCodeOnline(workspace_id, user_id)
        .then((res) => {
          console.debug(res?.data?.message);
          if (res?.data?.response?.length === 0) {
            setOnlineQr(true);
          } else {
            setOnlineQr(false);
          }
        })
        .catch((err) => {
          console.debug(err.message);
        });
    };

    const getRetrievedMasterQrCode = async () => {
      await retrieveMasterQr(workspace_id, user_id)
        .then((res) => {
          console.debug(res?.data?.message);
          if (res?.data?.response?.length === 0) {
            setRetrivedMasterQrCode(true);
          } else {
            setRetrivedMasterQrCode(false);
          }
        })
        .catch((err) => {
          console.debug(err.message);
        });
    };

    getUserQrcodeOnline();
    getRetrievedMasterQrCode();
    getUserDetailsFunc();
  }, []);

  const handleNavigateToShop = () => {
    navigate("/offline-store");
  };

  const toggleAccordion = (chatId) => {
    setExpandedChatId(chatId === expandedChatId ? null : chatId);
  };

  const chatData = [
    { id: 1, name: "John Doe", message: "Call me back ASAP!" },
    { id: 2, name: "Jane Smith", message: "Hello, how are you?" },
    { id: 3, name: "Jemal khalid", message: "What's up!" },
    { id: 4, name: "Abraham Lincon", message: "How have you been." },
    { id: 5, name: "Eric Davidson", message: "We will have a meeting" },
  ];

  const DummyData = ({ chat }) => {
    const isExpanded = chat.id === expandedChatId;
    return (
      <div className='overflow-auto bg-white rounded-xl mb-3'>
        <div className='p-2'>
          <div
            className='w-full flex flex-col items-start justify-center p-2 gap-y-1 cursor-pointer'
            onClick={() => toggleAccordion(chat.id)}
          >
            <span className='font-bold text-gray-700'>{chat.name}</span>
          </div>
          <div
            className={`grid overflow-hidden transition-all duration-300 ease-in-out text-slate-600 ${
              isExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className='overflow-hidden flex flex-col justify-between gap-y-2'>
              <div className='h-[220px] rounded-md border-2 border-sky-500 p-2'>
                This is the chat
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <input
                  className='w-full placeholder:italic placeholder:text-slate-400 placeholder:text-sm block bg-white border border-slate-300 py-2 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 rounded-2xl px-2'
                  type='text'
                  placeholder='message'
                />
                <IoMdSend size={28} className='text-blue-600 cursor-pointer' />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
          {/* <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={6000}
                            onClose={handleSnackbarClose}
                            message={snackbarMessage}
                        /> */}
        </div>
      ) : (
        <div className='h-screen m-0 p-0 gradient_ flex '>
          <div className='w-full h-full bg-white margin_ shadow-black mt-3.5 py-4 pl-4 pt-2 pb-6 rounded-md md:w-11/12 md:h-max'>
            {showBanner ? (
              <p className='text-rose-900 text-2xl text-center'>
                Have you created a seat yet, No?{" "}
                <button
                  className='cursor-pointer bg-white text-xl hover:bg-orange-100 text-gray-800 font-semibold py-1 px-2 border border-orange-400 rounded shadow m-2'
                  onClick={() => navigate("/profile")}
                >
                  Create One
                </button>
              </p>
            ) : null}
            <div className='h-24 border-b-2 border-zinc-400 m-2 flex items-center justify-between'>
              <img
                src={DigitalQLogo}
                // src=''
                alt='Dowell Logo'
                className='h-5/6 shadow-2xl mx-8'
              />
              {/* <p className="text-5xl font-bold">Q</p> */}

              <div className='flex items-center justify-center'>
                {
                  // showBanner?
                  true ? (
                    <div>
                      <div className='mr-12 relative cursor-pointer'>
                        <FaRegBell
                          size={32}
                          color='rgb(156 163 175)'
                          onClick={() => setShowInfoModal(!showInfoModal)}
                        />
                        <div className='absolute top-[-5px] right-[-5px] bg-red-400  rounded-full text-white text-sm w-5 h-5 flex items-center justify-center shadow-2xl'>
                          2
                        </div>
                      </div>
                      {showInfoModal ? (
                        // false?
                        <div className='fixed flex flex-col top-32 right-36 w-max '>
                          <div className='fixed top-32 right-36 flex flex-col items-center justify-center bg-white shadow-xl rounded-md gap-y-1 mt-2 p-1'>
                            {isTicketLink && (
                              <div
                                className='w-full flex items-center justify-between bg-green-200 cursor-pointer group hover:bg-white rounded-md p-2'
                                onClick={() => navigate("/profile")}
                              >
                                <p className='text-sm text-center'>
                                  Have you created a ticket link yet, No?{" "}
                                </p>
                                <button className='cursor-pointer  text-sm group-hover:bg-slate-200 duration-200 ease-in-out hover:scale-105 text-gray-800 font-semibold py-1 px-1 bg-white rounded m-2'>
                                  Create One
                                </button>
                              </div>
                            )}
                            {isPaid && (
                              <div
                                className='w-full flex items-center justify-between bg-green-200 cursor-pointer group hover:bg-white rounded-md p-2'
                                onClick={() => navigate("/profile")}
                              >
                                <p className='text-sm text-center'>
                                  Have you paid yet, No?{" "}
                                </p>
                                <button className='cursor-pointer  text-sm group-hover:bg-slate-200 duration-200 ease-in-out hover:scale-105 text-gray-800 font-semibold py-1 px-1 bg-white rounded m-2'>
                                  Create One
                                </button>
                              </div>
                            )}
                            {isActive && (
                              <div
                                className='w-full flex items-center justify-between bg-green-200 cursor-pointer group hover:bg-white rounded-md p-2'
                                onClick={() => navigate("/profile")}
                              >
                                <p className='text-sm text-center'>
                                  Is it active, No?{" "}
                                </p>
                                <button className='cursor-pointer  text-sm group-hover:bg-slate-200 duration-200 ease-in-out hover:scale-105 text-gray-800 font-semibold py-1 px-1 bg-white rounded m-2'>
                                  Create One
                                </button>
                              </div>
                            )}
                            {onlineQr && (
                              <div
                                className='w-full flex items-center justify-between bg-green-200 cursor-pointer group hover:bg-white rounded-md p-2'
                                onClick={() => navigate("/profile")}
                              >
                                <p className='text-sm text-center'>
                                  Have you created an Online Qr, No?{" "}
                                </p>
                                <button className='cursor-pointer  text-sm group-hover:bg-slate-200 duration-200 ease-in-out hover:scale-105 text-gray-800 font-semibold py-1 px-1 bg-white rounded m-2'>
                                  Create One
                                </button>
                              </div>
                            )}
                            {retrivedMasterQrCode && (
                              <div
                                className='w-full flex items-center justify-between bg-green-200 cursor-pointer group hover:bg-white rounded-md p-2'
                                onClick={() => navigate("/profile")}
                              >
                                <p className='text-sm text-center'>
                                  Have you created a Master qr code yet, No?{" "}
                                </p>
                                <button className='cursor-pointer  text-sm group-hover:bg-slate-200 duration-200 ease-in-out hover:scale-105 text-gray-800 font-semibold py-1 px-1 bg-white rounded m-2'>
                                  Create One
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null
                }
                <img
                  src='https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg'
                  alt='Profile Photo'
                  className='h-10 w-10 rounded-full shadow-2xl cursor-pointer'
                  onClick={() => navigate("/profile")}
                />
                <button className='cursor-pointer flex items-center justify-between bg-white hover:bg-rose-100 text-gray-800 font-semibold py-2 px-2 border border-rose-600 rounded shadow mx-4'>
                  <CiLogout className='mx-1 text-xl' />
                  Logout
                </button>
              </div>
            </div>
            {showActivateSeat ? (
              <div className='border border-orange-400 bg-orange-50 w-max rounded margin_ flex items-center justify-center p-2'>
                <IoWarningOutline color='#fb923c' fontSize={"1.3rem"} />
                <p className='text-stone-600 text-lg text-center mx-2'>
                  Selected seat is not active...
                </p>
              </div>
            ) : null}
            <div className='flex items-start flex-col sm:flex-row my-4'>
              <div className='flex flex-col justify-between h-full w-full sm:w-[35%] mt-16 py-8 shadow-2xl '>
                <div className='flex flex-col justify-between h-full w-full sm:flex-row'>
                  <QueryClientProvider client={queryClient}>
                    <TableContainer
                      component={Paper}
                      sx={{ width: "98%", height: "max-content" }}
                    >
                      <Table
                        sx={{ minWidth: "100%" }}
                        aria-label='simple table'
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                width: "max-content",
                                padding: "1%",
                                fontWeight: "600",
                              }}
                              align='center'
                            >
                              Seat Number
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "max-content",
                                padding: "1%",
                                fontWeight: "600",
                              }}
                              align='center'
                            >
                              Payment Requested
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "max-content",
                                padding: "1%",
                                fontWeight: "600",
                              }}
                              align='left'
                            >
                              Payment Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* {qrCodeResponse
                            .slice(cardPagination, cardPagination + 5)
                            .map((row, index) => (
                              <TableRow key={index + "_"}>
                                <SeatRow
                                  key={index}
                                  seatNumber={index}
                                  pagination={cardPagination}
                                />
                              </TableRow>
                            ))} */}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </QueryClientProvider>
                  <div className='w-full m-2 flex items-center justify-center sm:w-1/6 sm:m-0'>
                    <div className='flex items-center rotate-0 sm:rotate-90'>
                      <button
                        className='cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-9 h-9'
                        onClick={() => decrementStepPagination()}
                      >
                        <IoIosArrowBack />
                      </button>
                      {createArrayWithLength(100)
                        .slice(cardPagination, cardPagination + 5)
                        .map((s, index) => (
                          <div className='rotate-0 sm:rotate-90'>
                            <button
                              className='rotate-0 bg-inherit text-black border-solid border border-sky-500 rounded-full m-0.5 w-9 h-9 sm:rotate-180'
                              onClick={() => {
                                setCardIndex(index);
                              }}
                              key={`${s}_button`}
                            >
                              {s + 1}
                            </button>
                          </div>
                        ))}
                      <button
                        className='cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-9 h-9'
                        onClick={() => incrementStepPagination(5, 100 / 5)}
                      >
                        <IoIosArrowForward />
                      </button>
                    </div>
                  </div>
                </div>
                {/* <div className='flex flex-col items-start justify-center ml-2 py-6 my-4'>
                  <div className='flex items- justify-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <input
                        type='number'
                        className='cursor-pointer p-0 text-4xl bg-inherit m-0 border-solid border  border-sky-500 rounded w-20 focus:outline-none sm:text-6xl sm:m-2 sm:p-1 sm:w-28'
                        min='1'
                        max='99'
                        value={seatNumber}
                        onChange={(event) => handleInputChange(event)}
                        ref={seatNumberRef}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            if (seatNumber) {
                              amountRef.current.focus();
                            }
                          }
                        }}
                      ></input>
                      <p className='text-sm mx-1 sm:text-lg sm:mx-2'>
                        Seat Number:
                      </p>
                    </div>
                    <div className='flex flex-col items-center justify-center'>
                      <input
                        ref={amountRef}
                        value={amountEntered}
                        type='number'
                        className='cursor-pointer p-0 text-4xl bg-inherit m-0 border-solid border  border-sky-500 rounded w-20 focus:outline-none sm:text-6xl sm:m-2 sm:p-1 sm:w-28'
                        onChange={(event) => handleAmountInputChange(event)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            if (amountEntered) {
                              handleEnterDataClick();
                            }
                          }
                        }}
                      ></input>
                      <p className='text-sm mx-1 sm:text-lg sm:mx-4'>Amount:</p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <button
                      className='cursor-pointer flex items-center justify-center bg-white hover:bg-green-100 text-gray-800 font-semibold py-2 px-4 border border-green-400 rounded shadow m-2'
                      onClick={handleEnterDataClick}
                    >
                      {enterPaymentRecordLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <>
                          Enter{" "}
                          <IoArrowForwardCircleSharp className='mx-2 text-xl' />
                        </>
                      )}
                    </button>
                  </div>
                </div> */}
                <div className='flex w-full my-2'>
                  <div className=' w-full shadow-inner p-4'>
                    <p className='p-3 bg-[#1c8382] text-[#fff] text-xl font-medium rounded sm:w-[98%] w-[100%] shadow-md'>
                      Orders
                    </p>
                    <div className='flex flex-wrap flex-col justify-center'>
                      <div className='flex-none grid gap-1 grid-cols-5 p-3'>
                        <div className=''>
                          <button className='text-black bg-[#bbbcbe] rounded m-0.5 w-full h-max py-2'>
                            S
                          </button>
                        </div>
                      </div>
                      <div className='flex items-center m-2 w-full justify-center'>
                        <button className='cursor-pointer bg-inherit text-black border-solid border-2 border-[#1c8382] rounded flex items-center justify-center bg-[#81d3d2] w-16 h-8 m-2'>
                          <IoIosArrowBack />
                        </button>
                        <button className='cursor-pointer bg-inherit text-black border-solid border-2 border-[#1c8382] rounded flex items-center justify-center bg-[#81d3d2] w-16 h-8 m-2'>
                          <IoIosArrowForward />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* <div className='sm:w-2/6 mx-4 shadow-inner sm:p-4 p-0'>
                    <p className='p-3 bg-[#1c8382] text-[#fff] text-xl font-medium rounded sm:w-[95%] w-[100%] shadow-md '>
                      Seats
                    </p>
                    <div className='flex-none grid gap-3 grid-cols-2 margin_'>
                      
                    </div>
                  </div> */}
                </div>
                {/* -------------------------------- tables and seats----------------------------------- */}
              </div>
              {/* -------------------------------------calculator-------------------------------------- */}
              <div className='w-full sm:w-[40%] flex flex-col items-center flex-wrap margin_ '>
                {/* <p className='text-xl py-2 bg-[#1c8382] text-[#fff] w-3/5 rounded font-medium my-2 sm:my-4 shadow-xl'>
                  {storeDetailsResponse[0]?.store_name
                    ? storeDetailsResponse[0]?.store_name
                    : "N/A"}
                </p> */}
                <div className='flex items-center justify-evenly flex-wrap sm:flex-row flex-col sm:w-full w-[90%] sm:m-2 m-0'>
                  <p className='text-2xl font-medium mx-1'>
                    {tableEntered ? tableEntered : "Table Number"}
                  </p>
                  <p className='text-2xl font-medium mx-1'>
                    {seatNumber ? seatNumber : "Seat Number"}
                  </p>
                  <p className='text-2xl font-medium mx-1'>
                    {orderNumber ? orderNumber : "Order"}
                  </p>
                  <p className='text-2xl font-medium mx-1'>
                    {amountEntered ? amountEntered : "Amount"}
                  </p>
                </div>
                <div className='flex w-full sm:mx-3 mx-0  mb-16 sm:mb-0'>
                  <div className='w-2/6 p-2'>
                    <p className='py-2 bg-[#1c8382] text-[#fff] text-lg font-medium w-full rounded m-3 shadow-xl'>
                      Seats
                    </p>
                    {/* <div className="w-full m-2 flex items-center justify-center sm:w-1/6 sm:m-0"> */}

                    {retrievingOrders ? (
                      <CircularProgress />
                    ) : (
                      <div className='flex flex-col items-center justify-center mt-2 w-full'>
                        <button
                          className='rotate-90 cursor-pointer bg-inherit text-black flex items-center justify-center w-max h-max'
                          onClick={() => decrementSeatPagination()}
                        >
                          <IoIosArrowBack />
                        </button>
                        {
                          <ul>
                            {/* {orderInitiatedForSeat
                              .slice(seatPagination, seatPagination + 5)
                              .map((s, index) => (
                                <div className=''>
                                  <li
                                    className='cursor-pointer flex flex-col items-center justify-start bg-[#bbbcbe] text-black rounded m-3 p-1 w-[100px] h-max'
                                    onClick={() => {
                                      setOrderNumber(s?.phone_number);
                                      setOrderInitiatedId(
                                        s?.order_initiated_id
                                      );
                                    }}
                                    key={`${s?.order_initiated_id}_button`}
                                  >
                                    {s?.phone_number}
                                  </li>
                                </div>
                              ))} */}
                          </ul>
                        }
                        <button
                          className='rotate-90 cursor-pointer bg-inherit text-black flex items-center justify-center w-max h-max'
                          onClick={() => {
                            incrementSeatPagination(5, 100 / 5);
                            // handleInputChange(seatNumber);
                          }}
                        >
                          <IoIosArrowForward />
                        </button>
                        {/* </div> */}
                      </div>
                    )}
                  </div>
                  <div className='w-3/5 mx-1 p-2'>
                    <p className='px-3 py-2 bg-[#1c8382] text-[#fff] text-lg font-medium rounded w-[99%] m-3 shadow-xl'>
                      Amount
                    </p>
                    <div className='flex-none items-center justify-evenly margin_ grid gap-3 grid-cols-3'>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "."].map((index, s) => (
                        <button
                          className='text-black bg-[#bbbcbe] rounded w-full h-full m-3 text-2xl'
                          onClick={() => {
                            if (index === 0 && amountEntered === "0") {
                              return;
                            }
                            if (amountEntered === "" && index === 0) {
                              return;
                            }
                            if (index === "." && amountEntered.includes(".")) {
                              return;
                            }
                            // setCardIndex(cardIndex + index);
                            setAmountEntered(amountEntered + `${index}`);
                          }}
                          key={`${s}_button`}
                        >
                          {index}
                        </button>
                      ))}
                      <button
                        className='cursor-pointer flex items-center justify-center bg-white hover:bg-green-100 text-gray-800 border border-green-400 rounded shadow w-full h-full text-xl m-2'
                        // onClick={handleEnterDataClick}
                      >
                        {enterPaymentRecordLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <>
                            OK{" "}
                            <IoArrowForwardCircleSharp className='mx-2 text-xl' />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* -------------------------------------calculator-------------------------------------- */}
              {/* -------------------------------------Chat Bar-------------------------------------- */}
              <div className='w-full sm:w-[25%] mt-4 m-2  rounded-xl'>
                <div className='h-[470px] bg-gray-200 rounded p-2 overflow-auto'>
                  <div className='flex items-center justify-between p-2'>
                    <span className='font-semibold text-2xl text-sky-500'>
                      Chats
                    </span>
                  </div>
                  {chatData.length > 0 ? (
                    <div>
                      {chatData.map((chat) => (
                        <DummyData key={chat.id} chat={chat} />
                      ))}
                    </div>
                  ) : (
                    <div className='flex items-center justify-center p-3'>
                      <span className='font-semibold text-2xl'>
                        No messages yet
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* -------------------------------------Chat Bar-------------------------------------- */}
            </div>

            <div className='sm:hidden h-[80px] sm:h-full shadow-black mt-3.5 mr-2 py-8 sm:py-0 px-2  w-full sm:w-32  bg-[#eeeef0] flex flex-row sm:flex-col items-center justify-center gap-y-24 gap-x-24'>
              <HiOutlineStatusOnline
                size={40}
                className=' cursor-pointer'
                onClick={handleNavigateToShop}
              />
              <CiShop size={44} className=' cursor-pointer' />
            </div>
            {/* <div className="flex flex-col m-1 items-center justify-center m-4 sm:flex-row sm:m-6">
                                            <button class="cursor-pointer bg-white hover:bg-orange-100 text-gray-800 font-semibold py-2 px-4 border border-orange-400 rounded shadow m-2">Close Seat/Service Desk</button>
                                            <button class="cursor-pointer bg-white hover:bg-sky-100 text-gray-800 font-semibold py-2 px-4 border border-sky-400 rounded shadow m-2">Start Service to Selected Seat/Desk</button>
                                        </div> */}
          </div>

          <div className='hidden h-[80px] sm:h-full shadow-black mt-3.5 mr-2 py-8 sm:py-0 px-2  w-full sm:w-[70px]  bg-[#eeeef0] sm:flex flex-row sm:flex-col items-center justify-center gap-y-24 gap-x-24'>
            <div className='flex flex-col items-center justify-center'>
              <CiShop
                size={44}
                className=' cursor-pointer'
                onClick={handleNavigateToShop}
              />
              <span>Offline</span>
            </div>
            <HiOutlineStatusOnline size={40} className=' cursor-pointer' />
          </div>
        </div>
      )}
    </>
  );
};
export default LandingPage;

export function createArrayWithLength(length) {
  return Array.from({ length }, (_, index) => index);
}
