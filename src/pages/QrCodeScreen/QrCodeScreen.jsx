import { React, useEffect, useState } from "react";
import { FaHandPointUp } from "react-icons/fa";
import { RiBillFill } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import {
  initiateNewOrder,
  initiateOlderOrder,
} from "../../../services/qServices";
import { formatDateForAPI } from "../../helpers/helpers";
import { CircularProgress } from "@mui/material";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlinePayments } from "react-icons/md";
import { getStoreData, getMenuData } from "../../../services/qServices";
import MenuCard from "./MenuCard";
import { useNavigate } from "react-router-dom";
import { FaPerson } from "react-icons/fa6";
import { PiChatCircleTextDuotone } from "react-icons/pi";
import Modal from "./ScreenData";
import { IoMdSend } from "react-icons/io";
import io from 'socket.io-client';

const queryClient = new QueryClient();
const ENDPOINT="https://www.dowellchat.uxlivinglab.online"
const QrCodeScreen = () => {
  const navigate = useNavigate();

  //   const queryClient = new QueryClient();
  const currentDate = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const useQueryParams = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQueryParams();
  const workspaceId = query.get("workspace_id");
  const seat_number = query.get("seat_number");
  const store_id = query.get("store_id");

  const [phoneModal, setPhoneModal] = useState(false);
  const [inputNumber, setInputValue] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [isnewOrder, setIsNewOrder] = useState(false);
  const [isNewOrderLoading, setIsNewOrderLoading] = useState(false);
  const [isOlderOrderLoading, setIsOlderOrderLoading] = useState(false);
  const [billIsNotGenerated, setBillIsNotGenerated] = useState({
    show: false,
    message: "",
  });
  const [billIsGenerated, setBillIsGenerated] = useState({
    show: false,
    message: "",
  });
  const [isStoreDataLoading, setIsStoreDataLoading] = useState(false);
  const [isMenuDataLoading, setIsMenuDataLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [olderOrderResponseForPayment, setOldOrderResponseForPayment] = useState({});
  const [recordNotFound, setRecordNotFound] = useState({
    show: false,
    message: "",
  });
  const [socket, setSocket] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const[ticketId,setTicketId]=useState("")
  const[userId,setUserId]=useState("")
  const[product,setProduct]=useState('SAMANTHA')

  useEffect(() => {
    const newSocket = io(ENDPOINT);
    setSocket(newSocket);
    return () => {
    newSocket.disconnect();
    };
}, []);




useEffect(()=>{
    if (socket) {
           socket.emit('create_ticket', {
            product: "SAMANTHA",
            workspace_id:"63cf89a0dcc2a171957b290b",
            email:"reddypranai2017@gmail.com",
            link_id:"25025148106687329435",
            api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
            created_at: new Date().getTime()
        });
            socket.on('ticket_response', (data) => {
                console.log(data);
        });

        const handleMessage = (data) => {
            console.log("ticket_message_response")
            console.log(data,_id);
        }
    socket.on('ticket_message_response', handleMessage);
        
}
},[socket])





function sendMessage(){
    socket.emit('ticket_message_event', {
        ticket_id:123,
        product: "SAMANTHA",
        message_data: "Hi from pranai",
        user_id: 100,
        reply_to: "None",
        workspace_id: "63cf89a0dcc2a171957b290b",
        api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
        created_at: new Date().getTime()
    });

}

//workspace_id 
function getAllMessages(){//not working
    console.log("Hello")
    socket.emit('get_ticket_messages', {
        ticket_id: 123,
        product: "SAMANTHA",
        workspace_id: "63cf89a0dcc2a171957b290b",
        api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
    });

}
  const handleSendChatMessage = () => {
    if (messageText.trim() !== "") {
      console.log("Sending message:", messageText);
      setSentMessages([...sentMessages, messageText]);
      setMessageText("");
    }
  };

  const dataToPostForQuery = {
    workspace_id: workspaceId,
    date: formatDateForAPI(currentDate),
    store_id: store_id,
    phone_number: inputNumber,
  };

  const { isLoading, data, isError } = useQuery(
    ["menuData"],
    () =>
      // initiateOlderOrder(dataToPostForQuery),
      handleOrder(),
    {
      refetchInterval: 15000,
    }
  );

  const handleOlderOrder = () => {
    setPhoneModal(true);
    setIsNewOrder(false);
  };

  const handleNewOrderClick = async () => {
    if (inputNumber.length === 0) {
      return null;
    }
    const dataToPost = {
      workspace_id: workspaceId,
      date: formatDateForAPI(currentDate),
      timezone: timeZone,
      seat_number: seat_number,
      store_id: store_id,
      phone_number: inputNumber,
    };
    console.log(dataToPost);
    setIsNewOrderLoading(true);
    await initiateNewOrder(dataToPost)
      .then((res) => {
        console.log("initiate new order resss", res);
        setIsNewOrderLoading(false);
        setShowModal(false);
      })
      .catch((err) => {
        setIsNewOrderLoading(false);
        console.log("initiate new order err", err);
      });
  };

  const handleNewOrder = () => {
    setPhoneModal(true);
    setIsNewOrder(true);
  };

  const handleOrder = async () => {
    if (inputNumber.length === 0) {
      return null;
    }
    setIsOlderOrderLoading(true);
    const dataToPost = {
      workspace_id: workspaceId,
      date: formatDateForAPI(currentDate),
      store_id: store_id,
      phone_number: inputNumber,
    };

    // console.log(dataToPost);
    await initiateOlderOrder(dataToPost)
      .then(res => {
        console.log("initiate older order resss", res?.data?.success);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>.');
        if (res?.data?.success === false) {
          setBillIsNotGenerated({
            show: true,
            message: res?.data?.message,
          });
        }
        setIsOlderOrderLoading(false);
        setShowModal(false);
      })
      .catch((err) => {
        console.log("initiate older order err", err);
        setIsOlderOrderLoading(false);
        if (err?.response?.status === 400) {
          navigate('/error');
        }
        if (err?.response?.status === 402) {
          console.log('a gayaaaaaaaa');
          setBillIsNotGenerated({
            show: false,
            message: "",
          })
          setBillIsGenerated({
            show: true,
            message: err?.response?.data?.message,
          });
          setOldOrderResponseForPayment(err?.response?.data?.response);
          setShowModal(false);
        }
        if (err?.response?.status === 404) {
          setRecordNotFound({
            show: true,
            message: err?.response?.data?.message,
          });
        }
      });

    // setShowModal(false);
  };

  useEffect(() => {
    setIsStoreDataLoading(true);
    getStoreData(workspaceId)
      .then((res) => {
        console.log("get store data ress", res.data);
        setStoreData(res?.data?.response);
        setIsStoreDataLoading(false);
      })
      .catch((err) => {
        console.log("get store data errrrrr", err);
        setIsStoreDataLoading(false);
      });
  }, [showModal]);

  useEffect(() => {
    setIsMenuDataLoading(true);
    getMenuData(workspaceId, store_id)
      .then((res) => {
        console.log("get Menu data ress", res.data);
        setMenuData(res?.data?.response);
        setIsMenuDataLoading(false);
      })
      .catch((err) => {
        console.log("get store data errrrrr", err);
        setIsMenuDataLoading(false);
      });
  }, [showModal]);

  return (
    <>
      {showModal ? (
        <>
          {
            recordNotFound.show ? <p className="text-lg text-rose-500 font-medium">{recordNotFound.message}</p> : <></>
          }
          <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center'>
            {phoneModal ? (
              <div className='h-40 w-64 rounded bg-[#bbbcbe] flex flex-col gap-5 items-center justify-center'>
                <input
                  className='placeholder:italic placeholder:text-slate-400 block bg-white w-3/4 border border-slate-300 py-2 pl-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 sm:text-sm'
                  placeholder='Enter phone number'
                  type='text'
                  value={inputNumber}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                {isnewOrder ? (
                  <button
                    className='px-7 py-2 rounded bg-[#1c8382] text-white text-lg font-medium'
                    onClick={handleNewOrderClick}
                  >
                    {isNewOrderLoading ? <CircularProgress /> : "Enter"}
                  </button>
                ) : (
                  <button
                    className='px-7 py-2 rounded bg-[#1c8382] text-white text-lg font-medium'
                    onClick={handleOrder}
                  >
                    {isOlderOrderLoading ? <CircularProgress /> : "Enter"}
                  </button>
                )}
              </div>
            ) : (
              <div className='h-40 w-64 rounded bg-[#bbbcbe] flex flex-col gap-5 items-center justify-center'>
                <button
                  className='px-7 py-2 rounded bg-[#1c8382] text-white text-lg font-medium'
                  onClick={handleOlderOrder}
                >
                  Older order
                </button>
                <button
                  className='px-7 py-2 rounded bg-[#1c8382] text-white text-lg font-medium'
                  onClick={handleNewOrder}
                >
                  New order
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className='flex flex-col fixed top-0 left-0 w-full h-full items-center justify-center p-2'>
          <div className='flex items-center justify-evenly h-12 w-full bg-[#1c8382] rounded gap-2 text-[#fff] shadow-xl'>
            <p className='text-lg font-medium'>
              {storeData[0]?.store_name === ""
                ? "N/A"
                : storeData[0]?.store_name}
            </p>
            <p className='text-lg font-medium'>{currentDate?.toDateString()}</p>
          </div>
          {billIsNotGenerated?.show ? (
            <p className='text-sm font-semibold text-rose-600'>
              {billIsNotGenerated?.message}
            </p>
          ) : (
            <></>
          )}
          {billIsGenerated?.show ? (
            <p className='text-sm font-semibold text-green-600'>
              {billIsGenerated?.message}
            </p>
          ) : (
            <></>
          )}
          {/* Menu display is here ---------------------------------------------------- */}
          <div className='flex-grow h-96 w-full shadow-md rounded my-1 flex flex-col items-center  justify-center overflow-auto bg-[#f0ffff]'>
            <div className='w-full h-full p-2'>
              <h3 className='text-2xl font-semibold mb-2 text-center'>
                Menu Items
              </h3>
              {menuData?.map((menu) => (
                <MenuCard key={menu?._id} menus={menu?.menu_data} />
              ))}
            </div>
          </div>
          <div className='flex-none h-12 w-full bg-[#1c8382] rounded mb-2 flex items-center justify-center text-[#fff]'>
            <p className="text-xl font-medium">{inputNumber}</p>
          </div>
          {/* {billIsNotGenerated.show && (
                                    <div className="absolute inset-0 bg-gray-900 opacity-50 z-50"></div>
                                )} */}
          <div className='flex-none h-20 w-full rounded grid gap-3 grid-cols-4'>
            <div className={`cursor-pointer min-h-[50px] rounded flex items-center justify-center ${olderOrderResponseForPayment?.amount ? 'bg-cyan-200' : 'bg-[#bbbcbe] text-[#fff]'}`}>
              {
                olderOrderResponseForPayment?.amount ?
                  <button
                    className='font-bold text-2xl sm:text-base lg:text-3xl p-1 text-center flex sm:flex-row flex-col items-center justify-center'
                  // disabled={billIsNotGenerated.show}
                  >
                    <p className="font-medium">{`Amount =`}</p>
                    {olderOrderResponseForPayment?.amount}
                  </button> :
                  <button
                    className='text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center'
                  // disabled={billIsNotGenerated.show}
                  >
                    <GiTakeMyMoney fontSize={"1.5rem"} className='sm:mr-2 mr-0' />
                    Amount to pay
                  </button>
              }
            </div>
            <div className={`cursor-pointer min-h-[50px] rounded flex items-center justify-center ${olderOrderResponseForPayment?.is_paid === false ? 'bg-green-400 shadow-md shadow-2xl' : 'bg-[#bbbcbe] text-[#fff]'}`}>
              {/* <FaHandPointUp className='text-2xl sm:text-4xl lg:text-4xl' /> */}
              {
                olderOrderResponseForPayment?.is_paid === false ?
                  <a className='text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center'
                    href={olderOrderResponseForPayment?.payment_link}
                    // href="https://chat.openai.com/c/3105895a-d83c-45d5-9001-6ab9122cea21"
                    target="blank"
                  >
                    <MdOutlinePayments
                      fontSize={"1.5rem"}
                      className='sm:mr-2 mr-0'
                    />
                    <p className="text-xl">Pay</p>
                  </a> :
                  <button className='text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center'>
                    <MdOutlinePayments
                      fontSize={"1.5rem"}
                      className='sm:mr-2 mr-0'
                    />
                    Pay
                  </button>
              }
            </div>
            <div className='cursor-pointer min-h-[50px] rounded border border-sky-400 flex items-center justify-center'>
              <button className='text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center'>
                <RiBillFill fontSize={"1.5rem"} className='sm:mr-2 mr-0' />
                Bill
              </button>
            </div>
            <div className='cursor-pointer min-h-[50px] rounded border border-sky-400 flex items-center justify-center'>
              <button className='text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center'
                onClick={() => setShowChatModal(true)}>
                {/* <IoPersonSharp className='text-2xl sm:text-4xl lg:text-4xl' /> */}
                <PiChatCircleTextDuotone fontSize={"1.5rem"} className='sm:mr-2 mr-0' />
                Chat
              </button>
            </div>
          </div>
          <Modal
            isOpen={showChatModal}
            onClose={() => setShowChatModal(false)}
            title="Chat"
          >
            <div className="flex flex-col items-end w-full h-52 overflow-scroll border border-sky-400 rounded-xl">
              {sentMessages.map((msg, index) => (
                <div key={index} className="right-0 px-3 py-1 bg-blue-400 rounded-xl my-2">{msg}</div>
              ))}
            </div>
            <div className="flex flex-row items-center justify-between">
              <textarea
                className="w-full h-max border rounded p-2 mb-2"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <IoMdSend
              fontSize={'2rem'}
                onClick={sendMessage}
              />
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default QrCodeScreen;
