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
import {
  getUserDetails,
  getQrCodeOnline,
  retrieveMasterQr,
  getInitiatedOrdersOnline,
  createOnlineOrder,
} from "../../../services/qServices";
import { CircularProgress, Modal } from "@mui/material";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { IoWarningOutline } from "react-icons/io5";
import DigitalQLogo from "../../assets/Digital_Q.svg";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { CiShop } from "react-icons/ci";
import { IoMdSend } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";
import { formatDateForAPI, getTimeZone } from "../../helpers/helpers";
import SeatRow from "./TableContent";
import { toast } from "react-toastify";

const workspace_id = "6385c0f18eca0fb652c94558";
const user_id = "660d7c78bdbc0038f13e0b2d";

const LandingPage = () => {
  const queryClient = new QueryClient();
  const OPEN_PAGE_URL = "https://www.q.uxlivinglab.online/";
  // const OPEN_PAGE_URL = 'http://localhost:5173/';
  const {
    currentUser,
    qrCodeResponse,
    qrCodeForOnlineStore,
    setQrCodeForOnlineStore,
  } = useCurrentUserContext();
  const [cardPagination, setCardPagination] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const navigate = useNavigate();
  const currentDate = new Date();
  const [showBanner, setShowBanner] = useState(false);
  const [enterPaymentRecordLoading, setEnterPaymentRecordLoading] =
    useState(false);
  const [seatNumber, setSeatNumber] = useState(null);
  const [amountEntered, setAmountEntered] = useState("");
  const [showActivateSeat, setShowActivateSeat] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const [expandedChatId, setExpandedChatId] = useState(null);
  const seatNumberRef = useRef(null);
  const [onlineOrdersRetrieved, setOnlineOrdersRetrieved] = useState([]);
  const [tablePagination, setTablePagination] = useState(0);
  const [qrCodeIdForSelectedSeat, setQrCodeIdForSelectedSeat] = useState(null);
  const [linkToShareForPayment, setLinkToShareForPayment] = useState("");
  const [orderInitiatedCustomerId, setOrderInitiatedCustomerId] = useState("");

  // ------------------------calculator--------------------
  const [seatPagination, setSeatPagination] = useState(0);
  const [orderNumber, setOrderNumber] = useState(null);
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

  useEffect(() => {
    const getUserDetailsFunc = async () => {
      await getUserDetails(currentUser?.userinfo?.client_admin_id)
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
      await getQrCodeOnline(
        currentUser?.userinfo?.client_admin_id,
        getSavedNewUserDetails()[0]?._id
      )
        .then((res) => {
          console.debug(res?.data?.message);
          if (res?.data?.response?.length === 0) {
            setOnlineQr(true);
          } else {
            setOnlineQr(false);
          }
          setQrCodeForOnlineStore(res?.data?.response);
        })
        .catch((err) => {
          console.debug(err.message);
        });
    };

    const getRetrievedMasterQrCode = async () => {
      await retrieveMasterQr(
        currentUser?.userinfo?.client_admin_id,
        getSavedNewUserDetails()[0]?._id
      )
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
    handleGetOldInitiatedOrders();
  }, []);

  const decrementTablesPagination = () => {
    if (tablePagination == 4) {
      setTablePagination(0);
    } else if (tablePagination > 4) {
      setTablePagination(tablePagination - 4);
    }
  };

  const incrementTablesPagination = (steps) => {
    if (steps + 1 <= 100) {
      if (steps + tablePagination !== 100) {
        setTablePagination(tablePagination + 4);
      }
    }
  };

  const handleNavigateToShop = () => {
    navigate("/offline-store");
  };

  const toggleAccordion = (chatId) => {
    setExpandedChatId(chatId === expandedChatId ? null : chatId);
  };

  const { isLoading, data, isError } = useQuery(
    ["menuData"],
    () => handleGetOldInitiatedOrders(),
    {
      refetchInterval: 15000, // Refresh every 15 seconds
    }
  );

  const handleGetOldInitiatedOrders = async () => {
    await getInitiatedOrdersOnline(currentUser?.userinfo?.client_admin_id, formatDateForAPI(currentDate), getSavedNewUserDetails()[0]?.store_ids?.online_store_id)
      .then((res) => {
        console.log("initiated oreders online res >>>", res.data.response);
        const oldInitiatedOrders = res.data.response;
        const reversedInitiatedOrders = oldInitiatedOrders.reverse();
        setOnlineOrdersRetrieved(reversedInitiatedOrders);
      })
      .catch((err) => {
        console.log("initiated oreders online err >>>", err);
      });
  };

  const handleEnterDataClick = async () => {
    if (orderNumber === null) {
      return toast.error("Please select order number first");
    }
    if (seatNumber === null) {
      return toast.error("Please select seat first");
    }
    if (amountEntered === "") {
      return toast.error("Please enter amount first");
    }
    // setEnterPaymentRecordLoading(true);
    const dataToPost = {
      workspace_id: currentUser?.userinfo?.client_admin_id,
      qrcode_id: qrCodeIdForSelectedSeat,
      date: formatDateForAPI(currentDate),
      timezone: currentUser?.userinfo?.timezone
        ? currentUser?.userinfo?.timezone
        : getTimeZone(),
      seat_number: seatNumber,
      store_id: getSavedNewUserDetails()[0]?.store_ids?.online_store_id,
      order_intiated_id: orderNumber,
      amount: amountEntered,
    };

    console.log("data to post for creating online ordder", dataToPost);
    await createOnlineOrder(dataToPost)
      .then((res) => {
        console.log("res >>>", res.data.response);
        toast.success("Online order created successfully");

        //creating link after order being created for pranai
        const link = `${OPEN_PAGE_URL}&store_type=ONLINE&workspace_id=${currentUser?.userinfo?.client_admin_id
          }&store_id=${getSavedNewUserDetails()[0]?.store_ids?.online_store_id
          }&seat_number=${seatNumber}&order_intiated_id=${orderNumber}&customer_user_id=${orderInitiatedCustomerId}`;

        setLinkToShareForPayment(link);
      })
      .catch((err) => {
        console.log("err >>>", err);
        toast.error("Unable to create online order, Please try again");
      })
      .finally(() => {
        setEnterPaymentRecordLoading(false);
      });

    const link = `${OPEN_PAGE_URL}&type=ONLINE&workspace_id=${currentUser?.userinfo?.client_admin_id
      }&store_id=${getSavedNewUserDetails()[0]?.store_ids?.online_store_id
      }&seat_number=${seatNumber}&order_intiated_id=${orderNumber}&customer_user_id=${orderInitiatedCustomerId}`;
    console.log("linkkkkkkkkkkkkkkkkkkkkkkk", link);
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
            className={`grid overflow-hidden transition-all duration-300 ease-in-out text-slate-600 ${isExpanded
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
            <p className='text-lg sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-500'>
              The Tiny Shop
            </p>

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
              <button className='cursor-pointer flex items-center justify-between bg-red-400 hover:bg-red-300 text-gray-800 font-semibold py-2 px-2 rounded-md shadow mx-4'>
                <CiLogout className='mx-1 text-2xl text-white' size={26} />
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
            <div className='flex flex-col justify-between h-full w-full sm:w-[35%] mt-2 py-2 shadow-2xl '>
              <div className='flex flex-col justify-between h-72 w-full sm:flex-row'>
                <QueryClientProvider client={queryClient}>
                  <TableContainer
                    component={Paper}
                    sx={{ width: "98%", height: "max-content" }}
                  >
                    <Table sx={{ minWidth: "100%" }} aria-label='simple table'>
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
                        {qrCodeForOnlineStore
                          ? qrCodeForOnlineStore
                            .slice(cardPagination, cardPagination + 5)
                            .map((row, index) => (
                              <TableRow key={index + "_"}>
                                <SeatRow
                                  key={index}
                                  seatNumber={index}
                                  pagination={cardPagination}
                                />
                              </TableRow>
                            ))
                          : null}
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
              <div className='flex w-full my-2'>
                <div className=' w-full shadow-inner p-4'>
                  <p className='p-3 bg-[#1c8382] text-[#fff] text-xl font-medium rounded sm:w-[98%] w-[100%] shadow-md'>
                    Orders
                  </p>
                  <div className='flex flex-wrap flex-col justify-center'>
                    <div className='flex-none grid gap-1 grid-cols-2 p-3 sm:w-[98%] w-[100%]'>
                      {onlineOrdersRetrieved ?
                        onlineOrdersRetrieved.length === 0 ? <p>No Order</p> :
                          onlineOrdersRetrieved
                            .slice(tablePagination, tablePagination + 4)
                            .map((s, index) => (
                              <div className=''>
                                <button
                                  className='text-black text-sm bg-[#bbbcbe] rounded m-0.5 w-full h-max py-2 overflow-hidden'
                                  onClick={() => {
                                    setOrderNumber(s?.order_initiated_id);
                                    setOrderInitiatedCustomerId(
                                      s?.customer_user_id
                                    );
                                  }}
                                  key={s.order_initiated_id}
                                >
                                  {s.order_initiated_id}
                                </button>
                              </div>
                            ))
                        : null}
                    </div>
                    <div className='flex items-center m-2 w-full justify-center'>
                      <button
                        className='cursor-pointer bg-inherit text-black border-solid border-2 border-[#1c8382] rounded flex items-center justify-center bg-[#81d3d2] w-16 h-8 m-2'
                        onClick={() => decrementTablesPagination()}
                      >
                        <IoIosArrowBack />
                      </button>
                      <button
                        className='cursor-pointer bg-inherit text-black border-solid border-2 border-[#1c8382] rounded flex items-center justify-center bg-[#81d3d2] w-16 h-8 m-2'
                        onClick={() => incrementTablesPagination(4, 100 / 4)}
                      >
                        <IoIosArrowForward />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* -------------------------------- tables and seats----------------------------------- */}
            </div>
            {/* -------------------------------------calculator-------------------------------------- */}
            <div className='w-full sm:w-[40%] flex flex-col items-center flex-wrap margin_ '>
              <div className='flex items-center justify-evenly flex-wrap sm:flex-row flex-col sm:w-full w-[90%] sm:m-2 m-0'>
                {/* <p className='text-2xl font-medium mx-1'>
                    {tableEntered ? tableEntered : "Table Number"}
                  </p> */}
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
                  <div className='flex flex-col items-center justify-center mt-2 w-full'>
                    <button
                      className='rotate-90 cursor-pointer bg-inherit text-black flex items-center justify-center w-max h-max'
                      onClick={() => decrementSeatPagination()}
                    >
                      <IoIosArrowBack />
                    </button>
                    {
                      <ul>
                        {qrCodeForOnlineStore
                          ? qrCodeForOnlineStore
                            .slice(seatPagination, seatPagination + 5)
                            .map((s, index) => {
                              const seatNumber = parseInt(
                                s?.seat_number?.split("_").pop()
                              );
                              return (
                                <li
                                  className='cursor-pointer flex flex-col items-center justify-start bg-[#bbbcbe] text-black rounded m-3 p-1 w-[100px] h-max'
                                  onClick={() => {
                                    setSeatNumber(seatNumber);
                                    setQrCodeIdForSelectedSeat(s?.qrcode_id);
                                  }}
                                  key={`${index}_button`}
                                >
                                  <span>{seatNumber}</span>
                                </li>
                              );
                            })
                          : null}
                      </ul>
                    }
                    <button
                      className='rotate-90 cursor-pointer bg-inherit text-black flex items-center justify-center w-max h-max'
                      onClick={() => {
                        incrementSeatPagination(5, 100 / 5);
                      }}
                    >
                      <IoIosArrowForward />
                    </button>
                  </div>
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
            </div>
            {/* -------------------------------------calculator-------------------------------------- */}
            {/* -------------------------------------Chat Bar-------------------------------------- */}
            <div className='w-full sm:w-[25%] mt-4 m-2 mb-28 sm:mb-0 rounded-xl'>
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

          <div className='fixed sm:relative sm:hidden flex bottom-0 right-0 sm:bottom-auto h-[80px] sm:h-full shadow-black mt-3.5  px-2  w-full sm:w-32  bg-[#eeeef0] flex-row sm:flex-col items-center justify-center gap-y-24 gap-x-24'>
            <div className='flex flex-col items-center justify-center'>
              <CiShop
                size={44}
                className=' cursor-pointer'
                onClick={handleNavigateToShop}
              />
              <span>Offline</span>
            </div>
            <div className='flex flex-col items-center justify-center h-full bg-green-400 w-[100px] rounded-md'>
              <HiOutlineStatusOnline size={40} className=' cursor-pointer' />
              <span>Online</span>
            </div>
          </div>
          {/* <div className="flex flex-col m-1 items-center justify-center m-4 sm:flex-row sm:m-6">
                                            <button class="cursor-pointer bg-white hover:bg-orange-100 text-gray-800 font-semibold py-2 px-4 border border-orange-400 rounded shadow m-2">Close Seat/Service Desk</button>
                                            <button class="cursor-pointer bg-white hover:bg-sky-100 text-gray-800 font-semibold py-2 px-4 border border-sky-400 rounded shadow m-2">Start Service to Selected Seat/Desk</button>
                                        </div> */}
        </div>

        <div className='hidden h-[80px] sm:h-full shadow-black mt-3.5 mr-2 py-8 sm:py-0  w-full sm:w-[70px] md:w-[110px] bg-[#eeeef0] sm:flex flex-row sm:flex-col items-center justify-center gap-y-24 gap-x-24'>
          <div className='flex flex-col items-center justify-center  cursor-pointer'>
            <CiShop size={44} onClick={handleNavigateToShop} />
            <span>Offline</span>
          </div>
          <div className='flex flex-col items-center justify-center w-full py-2 bg-green-400 rounded-md cursor-pointer '>
            <HiOutlineStatusOnline size={40} className='  text-white' />
            <span className='text-white'>Online</span>
          </div>
        </div>
      </div>
    </>
  );
};
export default LandingPage;

export function createArrayWithLength(length) {
  return Array.from({ length }, (_, index) => index);
}
