import { React, useState } from "react";
import { FaHandPointUp } from "react-icons/fa";
import { RiBillFill } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { initiateNewOrder, initiateOlderOrder } from "../../../services/qServices";
import { formatDateForAPI } from "../../helpers/helpers";
import { CircularProgress } from "@mui/material";
// import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlinePayments } from "react-icons/md";
import { FaPerson } from "react-icons/fa6";
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from 'react-query'

const QrCodeScreen = () => {
    const queryClient = new QueryClient();
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

    const dataToPostForQuery = {
        "workspace_id": workspaceId,
        "date": formatDateForAPI(currentDate),
        "store_id": store_id,
        "phone_number": inputNumber,
    }

    // const { isLoading, data, isError } = useQuery(
    //     ["seatData", ],
    //     () => initiateOlderOrder(dataToPostForQuery).then(() =>{}).catch(() =>{}),
    //     {
    //         refetchInterval: 15000, // Refresh every 15 seconds
    //     }
    // );

    const handleOlderOrder = () => {
        setPhoneModal(true);
        setIsNewOrder(false);
    };

    const handleNewOrderClick = async () => {
        if (inputNumber.length === 0) {
            return null;
        }
        const dataToPost = {
            "workspace_id": workspaceId,
            "date": formatDateForAPI(currentDate),
            "timezone": timeZone,
            "seat_number": seat_number,
            "store_id": store_id,
            "phone_number": inputNumber,
        }
        console.log(dataToPost);
        setIsNewOrderLoading(true);
        await initiateNewOrder(dataToPost).then(res => {
            console.log('initiate new order resss', res);
            setIsNewOrderLoading(false);
            setShowModal(false);
        }).catch(err => {
            setIsNewOrderLoading(false);
            console.log('initiate new order err', err);
        })
    }

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
            "workspace_id": workspaceId,
            "date": formatDateForAPI(currentDate),
            "store_id": store_id,
            "phone_number": inputNumber,
        }

        // console.log(dataToPost);
        await initiateOlderOrder(dataToPost).then(res => {
            console.log('initiate older order resss', res?.data?.success);

            if (res?.data?.success === false) {
                setBillIsNotGenerated({
                    show: true,
                    message: res?.data?.message,
                });
            }
            setIsOlderOrderLoading(false);
            setShowModal(false);
        }).catch(err => {
            console.log('initiate older order err', err);
            setIsOlderOrderLoading(false);
        });

        // setShowModal(false);
    };

    return (
        <>
            {
                showModal ?
                    (
                        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center'>
                            {phoneModal ? (
                                <div className='h-40 w-64 rounded-lg bg-orange-300 flex flex-col gap-5 items-center justify-center'>
                                    <input
                                        className='placeholder:italic placeholder:text-slate-400 block bg-white w-3/4 border border-slate-300 rounded-md py-2 pl-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 sm:text-sm'
                                        placeholder='Enter phone number'
                                        type='text'
                                        value={inputNumber}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />

                                    {
                                        isnewOrder ?
                                            <button
                                                className='px-7 py-2 rounded-full text-white font-semibold bg-gray-600'
                                                onClick={handleNewOrderClick}
                                            >
                                                {isNewOrderLoading ? <CircularProgress /> : 'Enter'}
                                            </button> :
                                            <button
                                                className='px-7 py-2 rounded-full text-white font-semibold bg-gray-600'
                                                onClick={handleOrder}
                                            >
                                                {isOlderOrderLoading ? <CircularProgress /> : 'Enter'}
                                            </button>
                                    }
                                </div>
                            ) : (
                                <div className='h-40 w-64 rounded-lg bg-orange-300 flex flex-col gap-5 items-center justify-center'>
                                    <button
                                        className='px-7 py-2 rounded-full text-white font-semibold bg-gray-600'
                                        onClick={handleOlderOrder}
                                    >
                                        Older order
                                    </button>
                                    <button
                                        className='px-7 py-2 rounded-full text-white font-semibold bg-gray-600'
                                        onClick={handleNewOrder}
                                    >
                                        New order
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                    :
                    (
                        <QueryClientProvider client={queryClient}>
                            <div className='flex flex-col fixed top-0 left-0 w-full h-full items-center justify-center p-4'>
                                <div className='flex items-center justify-evenly h-10 w-full bg-sky-200 rounded gap-2'>
                                    <p className="text-lg font-medium">French latte cafe,</p>
                                    <p className="text-lg font-medium">{currentDate?.toDateString()}</p>
                                </div>
                                {
                                    billIsNotGenerated?.show
                                        ?
                                        <p className="text-sm font-semibold text-rose-500">{billIsNotGenerated?.message}</p>
                                        :
                                        <></>
                                }
                                <div className='flex-grow h-96 w-full border border-sky-400 rounded my-1 flex items-center justify-center '>
                                    <p className='text-4xl'>Menu</p>
                                </div>
                                <div className='flex-none h-10 w-full border border-sky-400 rounded mb-2 flex items-center justify-center '>
                                    <p>{inputNumber}</p>
                                </div>
                                {/* {billIsNotGenerated.show && (
                                    <div className="absolute inset-0 bg-gray-900 opacity-50 z-50"></div>
                                )} */}
                                <div className='flex-none h-20 w-full  rounded grid gap-3 grid-cols-4'>
                                    <div className='cursor-pointer min-h-[50px] rounded border border-sky-400 flex items-center justify-center'>
                                    
                                        <button className='text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center'
                                        disabled={billIsNotGenerated.show}
                                        >
                                            <GiTakeMyMoney fontSize={'1.5rem'} className="sm:mr-2 mr-0" />
                                            Amount to pay
                                        </button>
                                    </div>
                                    <div className='cursor-pointer min-h-[50px] rounded border border-sky-400 flex items-center justify-center'>
                                        {/* <FaHandPointUp className='text-2xl sm:text-4xl lg:text-4xl' /> */}
                                        <button className="text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center">
                                            <MdOutlinePayments fontSize={'1.5rem'} className="sm:mr-2 mr-0" />
                                            Payment
                                        </button>
                                    </div>
                                    <div className='cursor-pointer min-h-[50px] rounded border border-sky-400 flex items-center justify-center'>
                                        <button className="text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center">
                                            <RiBillFill fontSize={'1.5rem'} className="sm:mr-2 mr-0" />
                                            Bill
                                        </button>
                                    </div>
                                    <div className='cursor-pointer min-h-[50px] rounded border border-sky-400 flex items-center justify-center'>
                                        <button className="text-xs sm:text-base lg:text-2xl p-1 text-center flex sm:flex-row flex-col items-center justify-center">
                                            {/* <IoPersonSharp className='text-2xl sm:text-4xl lg:text-4xl' /> */}
                                            <FaPerson fontSize={'1.5rem'} className="sm:mr-2 mr-0" />
                                            Call Waiter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </QueryClientProvider>
                    )
            }
        </>
    )
}

export default QrCodeScreen;