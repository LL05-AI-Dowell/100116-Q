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
  getQrCodeIdBySeatNumber,
  createOrder,
} from "../../../services/qServices";
import { CircularProgress, Modal } from "@mui/material";
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
import { retrieveInitiatedOrder } from "../../../services/qServices";
import { GiCancel } from "react-icons/gi";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { CiShop } from "react-icons/ci";

const API_URLS = [
  "You're almost ready to use the app!",
  "Setting up the 'Q' app.",
  "We're currently configuring user information.",
  "We're currently updating store details.",
  "We're currently arranging seating.",
];

const workspace_id = "6385c0f18eca0fb652c94558";

const LandingPage2 = () => {
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
    storeDetailsResponse,
    setStoreDetailsResponse,
  } = useCurrentUserContext();
  const [cardPagination, setCardPagination] = useState(0);
  const [tablePagination, setTablePagination] = useState(0);
  const [seatPagination, setSeatPagination] = useState(0);
  const [orderNumber, setOrderNumber] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
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
  const [qrCodeIdForSeatNumber, setQrCodeIdForSeatNumber] = useState("");
  const [enterPaymentRecordLoading, setEnterPaymentRecordLoading] =
    useState(false);
  const [seatNumber, setSeatNumber] = useState(null);
  const [amountEntered, setAmountEntered] = useState("");
  const [tableEntered, setTableEntered] = useState(null);
  const [showActivateSeat, setShowActivateSeat] = useState(false);
  const [noOrderInititatedForSeat, setNoOrderInititatedForSeat] =
    useState(false);
  const [orderInitiatedForSeat, setOrderInitiatedForSeat] = useState([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [orderInitiatedId, setOrderInitiatedId] = useState("");
  const [retrievingOrders, setRetrievingOrders] = useState(false);

  const incrementStepPagination = (steps, length) => {
    console.log(currentUser);
    if (steps + 1 <= 100) {
      if (steps + cardPagination !== 100) {
        setCardPagination(cardPagination + 5);
      }
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

  const decrementSeatPagination = () => {
    if (seatPagination == 5) {
      setSeatPagination(0);
    } else if (seatPagination > 5) {
      setSeatPagination(seatPagination - 5);
    }
  };

  const incrementTablesPagination = (steps, length) => {
    console.log(currentUser);
    if (steps + 1 <= 100) {
      if (steps + tablePagination !== 100) {
        setTablePagination(tablePagination + 10);
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

  const decrementTablesPagination = () => {
    if (tablePagination == 10) {
      setTablePagination(0);
    } else if (tablePagination > 10) {
      setTablePagination(tablePagination - 10);
    }
  };

  const handleInputChange = async (value) => {
    setNoOrderInititatedForSeat(false);
    setShowActivateSeat(false);
    setRetrievingOrders(true);
    console.log(
      currentUser?.userinfo?.client_admin_id,
      value,
      formatDateForAPI(currentDate),
      getSavedNewUserDetails()[0].store_ids[0]
    );
    await retrieveInitiatedOrder(
      currentUser?.userinfo?.client_admin_id,
      value,
      formatDateForAPI(currentDate),
      getSavedNewUserDetails()[0].store_ids[0]
    )
      .then((res) => {
        console.log("retrieved initiated order ress", res);
        if (res?.data?.response?.length === 0) {
          setNoOrderInititatedForSeat(true);
        } else {
          res.data.response.reverse();
          setOrderInitiatedForSeat(res?.data?.response);
        }
        setRetrievingOrders(false);
      })
      .catch((err) => {
        console.log("err retrieving initiated order err", err);
        if (err?.response?.status === 400) {
          navigate("/error");
        }
        setRetrievingOrders(false);
      });

    await getQrCodeIdBySeatNumber(currentUser?.userinfo?.client_admin_id, value)
      .then((res) => {
        console.log("res get qr code id by seat", res?.data?.response);
        setQrCodeIdForSeatNumber(res?.data?.response);
      })
      .catch((err) => {
        console.log("err get qr code id by seat no", err);
        if (err?.response?.status === 400) {
          setShowActivateSeat(true);
        }
      });
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
        console.log("get store data", res?.data?.response);

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
        // handleGetPaymentDetailForSeat(passed_user_details,1);
      })
      .catch((err) => {
        console.log("error qr code retrieval", err);
        if (err?.response?.status === 400) {
          navigate("/error");
        }
      });
  };

  const handleEnterDataClick = async () => {
    setEnterPaymentRecordLoading(true);
    const dataToPost = {
      workspace_id: currentUser?.userinfo?.client_admin_id,
      qrcode_id: qrCodeIdForSeatNumber,
      date: formatDateForAPI(currentDate),
      timezone: currentUser?.userinfo?.timezone,
      seat_number: seatNumber,
      store_id: getSavedNewUserDetails()[0].store_ids[0],
      order_intiated_id: orderInitiatedId,
      amount: amountEntered,
    };

    console.log("dataToPost", dataToPost);
    // console.log(dataToPost)
    // await createCustomerPayment(dataToPost).then(res => {
    //     setEnterPaymentRecordLoading(false);
    //     console.log('createCustomerPayment resss', res);
    //     setSeatNumber('');
    //     setAmountEntered('');
    // }).catch(err => {
    //     setEnterPaymentRecordLoading(false);
    //     console.log('err createCustomerPayment', err);
    //     if (err?.response?.status === 400) {
    //         navigate('/error');
    //     }
    // })

    await createOrder(dataToPost)
      .then((res) => {
        console.log("createOrder resss", res);
        setEnterPaymentRecordLoading(false);
      })
      .catch((err) => {
        setEnterPaymentRecordLoading(false);
        console.log("err createOrder", err);
        if (err?.response?.status === 400) {
          navigate("/error");
        }
      });
  };

  const handleCloseBanner = () => {
    setNoOrderInititatedForSeat(false);
  };

  const handleNavigateToShop = () => {
    navigate("/view");
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
      ) : (
        <div className='h-screen m-0 p-0 gradient_ flex flex-col sm:flex-row'>
          <div className='w-full h-full margin_ shadow-black mt-3.5 p-4 pt-2 pb-6 rounded-md md:w-[98%] sm:h-full bg-[#f6f6f6]'>
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
                <img
                  src='https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg'
                  alt='Profile Photo'
                  className='h-10 w-10 rounded-full shadow-2xl cursor-pointer'
                  onClick={() => navigate("/profile")}
                />
                <button class='cursor-pointer flex items-center justify-between bg-white hover:bg-rose-100 text-gray-800 font-semibold py-2 px-2 border border-rose-600 rounded shadow mx-4'>
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
            {noOrderInititatedForSeat ? (
              <div className='border border-orange-400 bg-orange-50 w-max rounded margin_ flex items-center justify-center p-2'>
                <IoWarningOutline color='#fb923c' fontSize={"1.3rem"} />
                <p className='text-stone-600 text-lg text-center mx-2'>
                  No Order is initiated for this seat..
                </p>
                <GiCancel
                  color='#fb923c'
                  fontSize={"0.8rem"}
                  onClick={handleCloseBanner}
                />
              </div>
            ) : null}
            <div className='flex flex-col sm:flex-row'>
              <div className='flex flex-col h-max sm:w-[60%] w-full items-center my-4'>
                <div className='flex flex-col justify-between h-full sm:h-[325px] w-full py-8 shadow-md sm:flex-row'>
                  <QueryClientProvider client={queryClient}>
                    <TableContainer
                      component={Paper}
                      sx={{
                        width: "98%",
                        height: "100%",
                        backgroundColor: "#f6f6f6",
                      }}
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
                          {qrCodeResponse
                            .slice(cardPagination, cardPagination + 5)
                            .map((row, index) => (
                              <TableRow key={index + "_"}>
                                <SeatRow
                                  key={index}
                                  seatNumber={index}
                                  pagination={cardPagination}
                                />
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </QueryClientProvider>
                  <div className='w-full m-2 flex items-center justify-center sm:w-1/6 sm:m-0'>
                    <div className='flex items-center rotate-0 sm:rotate-90'>
                      <button
                        className='cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-7 h-7'
                        onClick={() => decrementStepPagination()}
                      >
                        <IoIosArrowBack />
                      </button>
                      {createArrayWithLength(100)
                        .slice(cardPagination, cardPagination + 5)
                        .map((s, index) => (
                          <div className='rotate-0 sm:rotate-90'>
                            <button
                              className='rotate-0 bg-inherit text-black border-solid border border-sky-500 rounded-full m-0.5 w-7 h-7 sm:rotate-180'
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
                        className='cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-7 h-7'
                        onClick={() => incrementStepPagination(5, 100 / 5)}
                      >
                        <IoIosArrowForward />
                      </button>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col sm:flex-row w-full my-2'>
                  <div className='sm:w-4/6 w-full shadow-inner'>
                    <p className='p-2 bg-[#1c8382] text-[#fff] text-xl font-medium rounded margin_ sm:w-[90%] w-[100%] shadow-md'>
                      Tables
                    </p>
                    <div className='flex flex-wrap flex-col items-center justify-center m-2'>
                      <div className='flex items-center justify-center flex-wrap'>
                        {createArrayWithLength(
                          storeDetailsResponse[0].tables.length
                        )
                          .slice(tablePagination, tablePagination + 10)
                          .map((s, index) => (
                            <div className=''>
                              <button
                                className='text-black border-solid bg-[#bbbcbe] rounded m-0.5 w-[95px] h-8'
                                onClick={() => {
                                  setSelectedTableNumber(
                                    index + tablePagination
                                  );
                                  console.log(
                                    "Selected",
                                    storeDetailsResponse[0].tables[
                                      index + tablePagination
                                    ]?.seat_data,
                                    index + tablePagination + 1
                                  );
                                  if (
                                    storeDetailsResponse[0].tables[
                                      index + tablePagination
                                    ]?.seat_data.length === 0
                                  ) {
                                    setTableEntered("Table Number");
                                  } else {
                                    setTableEntered(
                                      index + tablePagination + 1
                                    );
                                  }
                                }}
                                key={`${s}_button`}
                              >
                                {s + 1}
                              </button>
                            </div>
                          ))}
                      </div>
                      <div className='flex items-center m-2'>
                        <button
                          className='cursor-pointer bg-inherit text-black border-solid border-2 border-[#1c8382] rounded flex items-center justify-center bg-[#81d3d2] w-16 h-8 m-2'
                          onClick={() => decrementTablesPagination()}
                        >
                          <IoIosArrowBack />
                        </button>
                        <button
                          className='cursor-pointer bg-inherit text-black border-solid border-2 border-[#1c8382] rounded flex items-center justify-center bg-[#81d3d2] w-16 h-8 m-2'
                          onClick={() =>
                            incrementTablesPagination(10, 100 / 10)
                          }
                        >
                          <IoIosArrowForward />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className='sm:w-1/6 full mx-4 shadow-inner'>
                    <p className='p-2 rounded mx-1 margin_ w-max bg-[#1c8382] text-[#fff] text-lg font-medium shadow-xl'>
                      Seats
                    </p>
                    <div className='flex flex-row flex-wrap items-center justify-center'>
                      {storeDetailsResponse[0].tables[selectedTableNumber]
                        ?.seat_data.length === 0 ? (
                        <p>No Seat</p>
                      ) : (
                        storeDetailsResponse[0].tables[
                          selectedTableNumber
                        ]?.seat_data.map((seat, index) => {
                          const seatNumberr = parseInt(
                            seat?.seat_number?.split("_").pop()
                          );
                          // {console.log('seat_number', seat?.seat_number)}
                          return (
                            <button
                              className='text-black border-solid bg-[#bbbcbe] rounded my-0.5 w-12 h-8'
                              onClick={() => {
                                handleInputChange(seatNumberr);
                                setSeatNumber(seatNumberr);
                              }}
                              key={`${index}_button`}
                            >
                              {seatNumberr}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-full sm:w-[40%] flex flex-col items-center flex-wrap margin_ mx-2'>
                <p className='text-xl py-2 bg-[#1c8382] text-[#fff] w-3/5 rounded font-medium my-2 sm:my-4 shadow-xl'>
                  {storeDetailsResponse[0]?.store_name
                    ? storeDetailsResponse[0]?.store_name
                    : "N/A"}
                </p>
                <div className='flex items-center justify-evenly flex-wrap sm:flex-row flex-col sm:w-full w-[90%] sm:m-6 m-0'>
                  <p className='text-4xl font-medium mx-1'>
                    {tableEntered ? tableEntered : "Table Number"}
                  </p>
                  <p className='text-4xl font-medium mx-1'>
                    {seatNumber ? seatNumber : "Seat Number"}
                  </p>
                  <p className='text-4xl font-medium mx-1'>
                    {orderNumber ? orderNumber : "Order"}
                  </p>
                  <p className='text-4xl font-medium mx-1'>
                    {amountEntered ? amountEntered : "Amount"}
                  </p>
                </div>
                <div className='flex w-full sm:mx-3 mx-0 p-4'>
                  <div className='w-2/6p-2'>
                    <p className='px-3 py-2 bg-[#1c8382] text-[#fff] text-lg font-medium rounded margin_ shadow-xl'>
                      Orders
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
                            {orderInitiatedForSeat
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
                              ))}
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
                  <div className='w-4/5 mx-1 mb-10 sm:mb-0'>
                    <p className='px-3 py-2 bg-[#1c8382] text-[#fff] text-lg font-medium rounded w-[93%] margin_ shadow-xl'>
                      Amount
                    </p>
                    <div className='flex flex-wrap items-center justify-evenly margin_'>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "."].map((index, s) => (
                        <button
                          className='text-black bg-[#bbbcbe] rounded w-1/5 h-[25%] m-3 text-2xl'
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
                        class='cursor-pointer flex items-center justify-center bg-white hover:bg-green-100 text-gray-800 border border-green-400 rounded shadow w-[24%] h-[25%] text-xl m-2'
                        onClick={handleEnterDataClick}
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
                <div className='h-[60px] fixed bottom-0 sm:h-full w-full sm:w-32 shadow-black mt-3.5 mr-2 px-2 pt-2   bg-[#eeeef0] flex sm:flex-col sm:hidden items-center justify-center sm:gap-y-24 gap-x-24 sm:gap-x-0'>
                  <HiOutlineStatusOnline
                    size={30}
                    className=' cursor-pointer'
                  />
                  <CiShop
                    size={34}
                    onClick={handleNavigateToShop}
                    className=' cursor-pointer'
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='hidden h-[180px] sm:h-full w-full sm:w-32 shadow-black mt-3.5 mr-2 px-2 pt-2   bg-[#eeeef0] sm:flex sm:flex-col items-center justify-center sm:gap-y-24 gap-x-12 sm:gap-x-0'>
            <HiOutlineStatusOnline size={40} className=' cursor-pointer' />
            <CiShop
              size={44}
              onClick={handleNavigateToShop}
              className=' cursor-pointer'
            />
          </div>
        </div>
      )}
    </>
  );
};
export default LandingPage2;

export function createArrayWithLength(length) {
  return Array.from({ length }, (_, index) => index);
}
