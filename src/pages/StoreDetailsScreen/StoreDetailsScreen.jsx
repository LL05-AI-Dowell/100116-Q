import { getStoreData, updatStoreDataAPI } from "../../../services/qServices";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { CiEdit } from "react-icons/ci";
import { MdViewList } from "react-icons/md";
import Dialog from '@mui/material/Dialog';
import { MdCancel } from "react-icons/md";
import TextField from '@mui/material/TextField';
import Select from "react-select";
import { IoIosAddCircle } from "react-icons/io";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";


const StoreDetailsScreen = () => {
    const { currentUser, qrCodeResponse } = useCurrentUserContext();
    const [storeData, setStoreData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [billGeneratedBy, setBillGeneratedBy] = useState('');
    const [storeName, setStoreName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedSeatForTable, setSelectedSeatForTable] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [seatOptions, setSeatOption] = useState([]);
    const [allPromises, setAllPromises] = useState([]);
    const [dataToPostForAllPromises, setDataToPostForAllPromises] = useState([]);
    const [isActive, setIsActive] = useState(false);

    const handleSeatChangeForTable = (event) => {
        const options = event.target.options;
        const selectedSeats = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedSeats.push(options[i].value);
            }
        }
        setSelectedSeatForTable(selectedSeats);
        console.log(selectedSeats);
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);

        const dataToPostForUpdatingPayment = {
            "update_data": {
                "PAYMENT_METHOD": event.target.value,
            },
            "timezone": currentUser?.userinfo?.timezone
        }

        const existingIndex = dataToPostForAllPromises.findIndex(item =>
            Object.keys(item.update_data).includes('PAYMENT_METHOD')
        );

        if (existingIndex !== -1) {
            setDataToPostForAllPromises(prevData => {
                const newData = [...prevData];
                newData[existingIndex] = dataToPostForUpdatingPayment;
                return newData;
            });
        } else {
            setDataToPostForAllPromises(prevData => [...prevData, dataToPostForUpdatingPayment]);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        getStoreData(currentUser?.userinfo?.client_admin_id).then(res => {
            console.log('get store data ress', res.data.response);
            setStoreData(res?.data?.response);
            setIsLoading(false);
        }).catch(err => {
            console.log('get store data errrrrr', err);
            setIsLoading(false);
        });
    }, [])

    // useEffect(() => {
    //     if (storeData[0]?.tables?.length) {
    //         const tableLength = storeData[0].tables.length;
    //         const numSeats = tableLength * 4;
    //         const options = Array.from({ length: numSeats }, (_, i) => ({ value: String(i + 1), label: i + 1 }));
    //         setSeatOption(options);
    //     }
    // }, [storeData]);

    useEffect(() => {
        if (storeData[0]?.tables?.length) {
            const tableLength = storeData[0].tables.length;
            const numSeats = tableLength * 4;
            const options = Array.from({ length: numSeats }, (_, i) => ({ value: String(i + 1), label: i + 1 }));
            console.log('responseeeeeeee', qrCodeResponse)
            setSeatOption(options);
            // const seatNumbers = qrCodeResponse?.map(item => parseInt(item.seat_number.split('_').pop()));
            // const filteredOptions = options?.filter(option => seatNumbers.includes(parseInt(option.label)));

            // setSeatOption(filteredOptions);
        }
    }, [storeData]);

    // const handleSelectChange = (selectedOptions, table_name) => {
    //     console.log('handleSelectChange', selectedOptions, table_name);

    //     setSelectedOption(selectedOptions);
    //     const remainingOptions = seatOptions.filter(option => !selectedOptions.includes(option));
    //     setSeatOption(remainingOptions);
    // };
    const handleSelectChange = (selectedOptions, tableName) => {
        console.log('handleSelectChange', selectedOptions, tableName);
    
        // setSelectedOption(selectedOptions);
        
        const updatedTables = storeData[0].tables.map(table => {
            if (table.table_name === tableName) {

                const newSeats = selectedOptions.map(option => ({
                    "seat_number": `seat_number_${option.label}`
                }));

                const updatedTable = {
                    ...table,
                    seat_data: [...table.seat_data, newSeats]
                };
                console.log('updatedTable', updatedTable);
                return updatedTable;
            }
            return table;
        });
        console.log('tablessssssssssssssssssssssssssssssssssssss',updatedTables);
    
        // Update the state with the modified tables data
        setSelectedOption(selectedOptions);
        const remainingOptions = seatOptions.filter(option => !selectedOptions.includes(option));
        setSeatOption(remainingOptions);
    };
    



    const handleCloseEditModal = () => {
        setShowEditModal(false);
    }

    const handleOpenEditModal = () => {
        setShowEditModal(true);
        setIsModalOpen(true);
    }
    const handleBillGeneratedByChange = (event) => {
        setBillGeneratedBy(event.target.value);

        const dataToPostForUpdatingBill = {
            "update_data": {
                "bill_genration_by": event.target.value,
            },
            "timezone": currentUser?.userinfo?.timezone
        }

        const existingIndex = dataToPostForAllPromises.findIndex(item =>
            Object.keys(item.update_data).includes('bill_genration_by')
        );

        if (existingIndex !== -1) {
            setDataToPostForAllPromises(prevData => {
                const newData = [...prevData];
                newData[existingIndex] = dataToPostForUpdatingBill;
                return newData;
            });
        } else {
            setDataToPostForAllPromises(prevData => [...prevData, dataToPostForUpdatingBill]);
        }
    };

    const handleStoreNameChange = (event) => {
        setStoreName(event.target.value);
    };

    const updatStoreName = () => {
        const dataToPostForUpdatingStoreName = {
            "update_data": {
                "store_name": storeName,
            },
            "timezone": currentUser?.userinfo?.timezone
        }
        // updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id,getSavedNewUserDetails()[0]._id)
        // setAllPromises(prevPromises => [...prevPromises, updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id, getSavedNewUserDetails()[0]._id, dataToPostForUpdatingStoreName)]);
        const existingIndex = dataToPostForAllPromises.findIndex(item =>
            Object.keys(item.update_data).includes('store_name')
        );

        if (existingIndex !== -1) {
            setDataToPostForAllPromises(prevData => {
                const newData = [...prevData];
                newData[existingIndex] = dataToPostForUpdatingStoreName;
                return newData;
            });
        } else {
            setDataToPostForAllPromises(prevData => [...prevData, dataToPostForUpdatingStoreName]);
        }
    }

    // updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id,getSavedNewUserDetails()[0]._id)
    // setAllPromises(prevPromises => [...prevPromises, updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id, getSavedNewUserDetails()[0]._id, dataToPostForUpdatingStoreName)]);

    const handleIsActiveChange = () => {
        setIsActive(!isActive);
        const dataToPostForUpdatingActiveStatus = {
            "update_data": {
                "is_active": !isActive,
            },
            "timezone": currentUser?.userinfo?.timezone
        }
        const existingIndex = dataToPostForAllPromises.findIndex(item =>
            Object.keys(item.update_data).includes('is_active')
        );

        if (existingIndex !== -1) {
            setDataToPostForAllPromises(prevData => {
                const newData = [...prevData];
                newData[existingIndex] = dataToPostForUpdatingActiveStatus;
                return newData;
            });
        } else {
            setDataToPostForAllPromises(prevData => [...prevData, dataToPostForUpdatingActiveStatus]);
        }
    }

    const check = () => {
        console.log('promisesssss', dataToPostForAllPromises);
    }


    return (
        <>
            <div className="w-full h-max p-4 flex flex-wrap items-center justify-evenly">
                {
                    isLoading ? <CircularProgress /> :
                        (
                            // [1,2,3,4,5,6]
                            storeData.map((store, index) => {
                                return (
                                    <div key={store?._id} className="w-[70%] md:w-[400px] h-full bg-[#ecf7ff] p-4 m-2 rounded shadow-xl">
                                        <div className="w-full flex flex-wrap">
                                            <div className="w-[35%] h-full flex items-center justify-center">
                                                {
                                                    store?.image_link ?
                                                        <img src={store?.image_link} className="w-[100px] h-[100px] rounded" /> :
                                                        <img src='https://nitida.co.za/wp-content/plugins/movedo-extension/assets/images/empty/full.jpg'
                                                            className="w-[100px] h-[100px] rounded"
                                                        />
                                                }
                                            </div>
                                            <div className="w-[60%] p-2 flex flex-col items-left justify-evenly">
                                                <p className="flex items-center justify-start text-lg font-medium">StoreName:<p className="text-sm font-normal">{store?.store_name ? store?.store_name : 'N/A'}</p></p>
                                                <p className="flex text-lg items-center justify-start text-lg font-medium">Activity Status:<p className="text-sm font-normal">{store?.is_active === true ? 'OPEN' : 'CLOSE'}</p></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-2 w-full justify-center">
                                            <button className="p-2 bg-orange-200 m-1 rounded px-4 flex items-center justify-center" onClick={handleOpenEditModal}><CiEdit fontSize={'1.2rem'} />Edit</button>
                                            <button className="p-2 bg-sky-200 m-1 rounded px-4 flex items-center justify-center"><MdViewList fontSize={'1.2rem'} />View</button>
                                        </div>
                                    </div>
                                )
                            })
                        )
                }
                {
                    showEditModal ?
                        <Dialog open={isModalOpen} onClose={false} className="w-[100%]">
                            <button onClick={check}>check</button>
                            <div className="p-4 w-full flex flex-col items-center justify-center rounded">
                                <div className="w-full flex items-center justify-end">
                                    <MdCancel fontSize={'1.2rem'} onClick={handleCloseEditModal} color="red" />
                                </div>
                                {
                                    <div className="flex mx-8">
                                        <div className="w-1/5 flex items-center justify-center">
                                            <img src="https://picsum.photos/id/1/200/300" alt="Store image" className="w-[100px] h-[100px]" />
                                        </div>
                                        <div className="w-4/5 flex flex-wrap">
                                            <div className="m-1">
                                                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Store Name</label>
                                                <input
                                                    type="text"
                                                    id="storeName"
                                                    className="mt-1 p-2 border rounded-md block w-full"
                                                    value={storeName}
                                                    onChange={handleStoreNameChange}
                                                />
                                            </div>
                                            <div className="m-2 p-4 flex items-center justify-center mt-2">
                                                {/* <button className="mt-1 p-2 border rounded-md block w-full">Save Store Name</button> */}
                                                <IoIosAddCircle className="flex ml-0 text-sky-500 cursor-pointer" fontSize={'2rem'} onClick={updatStoreName} />
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="billGeneratedBy" className="block text-sm font-medium text-gray-700">Bill Generated By</label>
                                                <select
                                                    id="billGeneratedBy"
                                                    className="mt-1 px-8 p-2 border rounded-md block w-full"
                                                    value={billGeneratedBy}
                                                    onChange={handleBillGeneratedByChange}
                                                >
                                                    <option value="">N/A</option>
                                                    <option value="MANAGER">MANAGER</option>
                                                    <option value="CUSTOMER">CUSTOMER</option>
                                                </select>
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                                                <select
                                                    id="paymentMethod"
                                                    className="mt-1 p-2 px-5 border rounded-md block w-full"
                                                    value={paymentMethod}
                                                    onChange={handlePaymentMethodChange}
                                                >
                                                    <option value="">Select Method...</option>
                                                    <option value="PHONEPAY">PHONEPAY</option>
                                                    <option value="GOOGLEPAY">GOOGLEPAY</option>
                                                    <option value="DIRECT_BANK">DIRECT_BANK</option>
                                                </select>
                                            </div>
                                            <label className="flex items-center justify-center margin_">
                                                <input
                                                    type="checkbox"
                                                    checked={isActive}
                                                    onChange={handleIsActiveChange}
                                                    className="mr-2"
                                                />
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                }
                                <p>Tables</p>
                                <div className="w-full flex flex-wrap items-center justify-center mx-16">
                                    {
                                        (
                                            storeData[0].tables.map((table, index) => {
                                                return (
                                                    <div key={table} className="w-[43%] h-full bg-[#ecf7ff] p-4 m-2 rounded shadow-xl">
                                                        <div className="m-1">
                                                            <label htmlFor="tableName" className="block text-sm font-medium text-gray-700">Table Name:</label>
                                                            <input
                                                                type="text"
                                                                id="tableName"
                                                                className="p-1 border rounded-md block w-full text-gray-500"
                                                                value={table?.table_name}
                                                                disabled={true}
                                                            />
                                                        </div>
                                                        <div className="m-1">
                                                            <label htmlFor="SeatNo" className="block text-sm font-medium text-gray-700">Seats</label>
                                                            <Select
                                                                defaultValue={selectedOption}
                                                                // onChange={setSelectedOption}
                                                                // onChange={handleSelectChange}
                                                                onChange={(selectedOptions) => handleSelectChange(selectedOptions, table.table_name)}
                                                                options={seatOptions}
                                                                isMulti={true}
                                                            />
                                                        </div>
                                                        <label className="flex items-center justify-center m-1">
                                                            <input
                                                                type="checkbox"
                                                                // checked={isTableActive}
                                                                // onChange={handleIsTableActiveChange}
                                                                className="mr-2"
                                                            />
                                                            Active
                                                        </label>
                                                    </div>
                                                )
                                            })
                                        )
                                    }
                                </div>
                            </div>
                        </Dialog> : <></>
                }
            </div>
        </>
    )

}

export default StoreDetailsScreen;