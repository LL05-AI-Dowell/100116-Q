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
  getQrCodeIdBySeatNumber,
  createOrder,
  getQrCodeOffline,
} from "../../../services/qServices";
import { CircularProgress, Modal } from "@mui/material";
import { formatDateForAPI } from "../../helpers/helpers";
import {
  NEW_USER_DETAILS_KEY_IN_SESSION_STORAGE,
  getSavedNewUserDetails,
} from "../../hooks/useDowellLogin";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import SeatRowOnline from "./TableContentOnline";
import DigitalQLogo from "../../assets/Digital_Q.svg";
import { retrieveInitiatedOrder } from "../../../services/qServices";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { CiShop } from "react-icons/ci";
import { toast } from "react-toastify";
import { FaRegBell } from "react-icons/fa";

const workspace_id = "6385c0f18eca0fb652c94558";
const user_id = "660d7c78bdbc0038f13e0b2d";

const LandingPage2 = () => {
  const queryClient = new QueryClient();
  const {
    currentUser,
    qrCodeResponse,
    storeDetailsResponse,
  } = useCurrentUserContext();
  const [cardPagination, setCardPagination] = useState(0);
  const [seatPagination, setSeatPagination] = useState(0);
  const [orderNumber, setOrderNumber] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const navigate = useNavigate();
  const currentDate = new Date();
  const [qrCodeIdForSeatNumber, setQrCodeIdForSeatNumber] = useState("");
  const [enterPaymentRecordLoading, setEnterPaymentRecordLoading] =
    useState(false);
  const [seatNumber, setSeatNumber] = useState(null);
  const [amountEntered, setAmountEntered] = useState("");
  const [tableEntered, setTableEntered] = useState(null);
  const [showActivateSeat, setShowActivateSeat] = useState(false);
  // const [noOrderInititatedForSeat, setNoOrderInititatedForSeat] =
  //   useState(false);
  const [orderInitiatedForSeat, setOrderInitiatedForSeat] = useState([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [orderInitiatedId, setOrderInitiatedId] = useState("");
  const [retrievingOrders, setRetrievingOrders] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isTicketLink, setIsTicketLink] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [tablePagination, setTablePagination] = useState(0);

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
    // setNoOrderInititatedForSeat(false);
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
      getSavedNewUserDetails()[0]?.store_ids?.offline_store_id
    )
      .then((res) => {
        console.log("retrieved initiated order ress", res);
        if (res?.data?.response?.length === 0) {
          // setNoOrderInititatedForSeat(true);
          toast.warning('No order initiated for selected Seat');
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
        setShowActivateSeat(false);
      })
      .catch((err) => {
        console.log("err get qr code id by seat no", err);
        if (err?.response?.status === 400) {
          toast.warning('Selected Seat is not active, You can activate seat by: Profile > Seat Information > Offline > Open Selected Seat')
          setShowActivateSeat(true);
        }
      });
  };



  const handleEnterDataClick = async () => {
    if (!seatNumber) {
      return toast.warn("Please select a Seat.");
    }
    if (!orderInitiatedId) {
      return toast.warn("Please select an Order.");
    }
    if (!amountEntered) {
      return toast.warn("Please select an Amount.");
    }
    if (showActivateSeat === true) {
      toast.warning('Selected Seat is not active, You can activate seat by: Profile > Seat Information > Offline > Open Selected Seat')
    }

    setEnterPaymentRecordLoading(true);
    const dataToPost = {
      workspace_id: currentUser?.userinfo?.client_admin_id,
      qrcode_id: qrCodeIdForSeatNumber,
      date: formatDateForAPI(currentDate),
      timezone: currentUser?.userinfo?.timezone,
      seat_number: seatNumber,
      store_id: getSavedNewUserDetails()[0]?.store_ids?.offline_store_id,
      order_intiated_id: orderInitiatedId,
      amount: amountEntered,
    };

    console.log("dataToPost", dataToPost);
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

    const getUserQrcodeOffline = async () => {
      await getQrCodeOffline(currentUser?.userinfo?.client_admin_id, getSavedNewUserDetails()[0]?._id)
        .then((res) => {
          console.debug(res?.data?.message);
          if (res?.data?.response?.length === 0) {
            setOfflineQr(true);
          } else {
            setOfflineQr(false);
          }
        })
        .catch((err) => {
          console.debug(err.message);
        });
    };

    getUserQrcodeOffline();
    getUserDetailsFunc();
  }, []);
  
  const handleNavigateToShop = () => {
    navigate("/online-store");
  };

  return (
    <>

      <div className='h-screen m-0 p-0 gradient_ flex'>
        <div className='w-full h-max margin_ shadow-black mt-3.5 p-4 pt-2 pb-6 rounded-md md:w-[98%] sm:h-full bg-[#f6f6f6]'>

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
                    <div className='mr-6 sm:mr-12 relative cursor-pointer'>
                      <FaRegBell
                        size={32}
                        color='rgb(156 163 175)'
                        onClick={() => setShowInfoModal(!showInfoModal)}
                      />
                      <div className='absolute top-[-5px] right-[-5px] bg-red-400  rounded-full text-white text-sm w-5 h-5 flex items-center justify-center '>
                        2
                      </div>
                    </div>
                    {showInfoModal ? (
                      // false?
                      <div className='fixed top-32 right-36 w-max h-max'>
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
                          ? qrCodeResponse
                            .slice(cardPagination, cardPagination + 5)
                            .map((row, index) => (
                              <TableRow key={index + "_"}>
                                <SeatRowOnline
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
                <div className='sm:w-5/6 w-full shadow-inner p-4'>
                  <p className='p-3 bg-[#1c8382] text-[#fff] text-xl font-medium rounded sm:w-[98%] w-[100%] shadow-md'>
                    Tables
                  </p>
                  <div className='flex flex-wrap flex-col justify-center'>
                    <div className='flex-none grid gap-1 grid-cols-5 p-3'>
                      {createArrayWithLength(
                        storeDetailsResponse ? storeDetailsResponse[0].tables.length : 0
                      )
                        .slice(tablePagination, tablePagination + 10)
                        .map((s, index) => (
                          <div className=''>
                            <button
                              className='text-black bg-[#bbbcbe] rounded m-0.5 w-full h-max py-2'
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
                                  setSeatNumber("Seat Number");
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
                    <div className='flex items-center m-2 w-full justify-center'>
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
                <div className='sm:w-2/6 mx-4 shadow-inner sm:p-4 p-0'>
                  <p className='p-3 bg-[#1c8382] text-[#fff] text-xl font-medium rounded sm:w-[95%] w-[100%] shadow-md '>
                    Seats
                  </p>
                  <div className='flex-none grid gap-3 grid-cols-2 margin_'>
                    {storeDetailsResponse ? storeDetailsResponse[0].tables[selectedTableNumber]
                      ?.seat_data.length === 0 ? (
                      <p className='w-full flex items-center justify-center'>
                        No Seat
                      </p>
                    ) : (
                      storeDetailsResponse[0].tables[
                        selectedTableNumber
                      ]?.seat_data
                        // [1,2,3,4]
                        .map((seat, index) => {
                          const seatNumberr = parseInt(
                            seat?.seat_number?.split("_").pop()
                          );
                          // {console.log('seat_number', seat?.seat_number)}
                          return (
                            <button
                              className='text-black bg-[#bbbcbe] rounded my-0.5 w-[80%] h-full py-2'
                              onClick={() => {
                                handleInputChange(seatNumberr);
                                setSeatNumber(seatNumberr);
                              }}
                              key={`${index}_button`}
                            >
                              {seatNumberr}
                              {/* {index} */}
                            </button>
                          );
                        })
                    ) : <></>
                    }
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
              <div className='flex w-full sm:mx-3 mx-0 sm:p-4 p-0 mb-16 sm:mb-0'>
                <div className='w-2/6 p-2'>
                  <p className='py-2 bg-[#1c8382] text-[#fff] text-lg font-medium w-full rounded m-3 shadow-xl'>
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
                        orderInitiatedForSeat.length === 0 ? <p>No Order</p> :
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
                <div className='w-4/5 mx-1 p-2'>
                  <p className='px-3 py-2 bg-[#1c8382] text-[#fff] text-lg font-medium rounded w-[99%] m-3 shadow-xl'>
                    Amount
                  </p>
                  <div className='flex-none items-center justify-evenly margin_ grid gap-3 grid-cols-3'>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "."].map((index, s) => (
                      <button
                        className='text-black bg-[#bbbcbe] rounded w-full h-full m-3 text-2xl'
                        onClick={() => {
                          if (orderInitiatedForSeat.length === 0) {
                            return toast.warn("Please select order first");
                          }
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
          </div>
        </div>
        <div className='fixed sm:relative flex bottom-0 sm:bottom-auto h-[80px] sm:h-full shadow-black mt-3.5 mr-2 py-8 sm:py-0 w-full sm:w-[70px] md:w-[110px]  bg-[#eeeef0] sm:flex flex-row sm:flex-col items-center justify-center gap-y-24 gap-x-24'>
          <div className='flex flex-col items-center justify-center bg-green-400 w-[100px] sm:w-full py-2 rounded-md cursor-pointer'>
            <CiShop size={44} className=' text-white' />
            <span className='text-white'>Offline</span>
          </div>
          <div
            className='flex flex-col items-center justify-center cursor-pointer'
            onClick={handleNavigateToShop}
          >
            <HiOutlineStatusOnline size={40} />
            <span>Online</span>
          </div>
        </div>
        {/* <div className='hidden h-[80px] sm:h-full shadow-black mt-3.5 mr-2 py-8 sm:py-0 px-2  w-full sm:w-32  bg-[#eeeef0] sm:flex flex-row sm:flex-col items-center justify-center gap-y-24 gap-x-24'>
            <HiOutlineStatusOnline
              size={40}
              className=' cursor-pointer'
              onClick={handleNavigateToShop}
            />
            <CiShop size={44} className=' cursor-pointer' />
          </div> */}
      </div>
    </>
  );
};
export default LandingPage2;

export function createArrayWithLength(length) {
  return Array.from({ length }, (_, index) => index);
}
