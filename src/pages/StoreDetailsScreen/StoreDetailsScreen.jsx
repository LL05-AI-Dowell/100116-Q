import { getStoreData, updatStoreDataAPI } from "../../../services/qServices";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { CiEdit } from "react-icons/ci";
import { MdViewList } from "react-icons/md";
import Dialog from "@mui/material/Dialog";
import { MdCancel } from "react-icons/md";
import TextField from "@mui/material/TextField";
import { FaUserEdit } from "react-icons/fa";
import Select from "react-select";
import { IoIosAddCircle } from "react-icons/io";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";

const StoreDetailsScreen = () => {
  const { currentUser, qrCodeResponse } = useCurrentUserContext();
  const [storeData, setStoreData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billGeneratedBy, setBillGeneratedBy] = useState("");
  const [storeName, setStoreName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedSeatForTable, setSelectedSeatForTable] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [seatOptions, setSeatOption] = useState([]);
  const [allPromises, setAllPromises] = useState([]);
  const [dataToPostForAllPromises, setDataToPostForAllPromises] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [storeBtn, setStoreBtn] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnColor, setBtnColor] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

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
      update_data: {
        PAYMENT_METHOD: event.target.value,
      },
      timezone: currentUser?.userinfo?.timezone,
    };

    const existingIndex = dataToPostForAllPromises.findIndex((item) =>
      Object.keys(item.update_data).includes("PAYMENT_METHOD")
    );

    if (existingIndex !== -1) {
      setDataToPostForAllPromises((prevData) => {
        const newData = [...prevData];
        newData[existingIndex] = dataToPostForUpdatingPayment;
        return newData;
      });
    } else {
      setDataToPostForAllPromises((prevData) => [
        ...prevData,
        dataToPostForUpdatingPayment,
      ]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getStoreData(currentUser?.userinfo?.client_admin_id)
      .then((res) => {
        console.log("get store data ress", res.data.response);
        setStoreData(res?.data?.response);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("get store data errrrrr", err);
        setIsLoading(false);
      });
  }, []);

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
      const options = Array.from({ length: numSeats }, (_, i) => ({
        value: String(i + 1),
        label: i + 1,
      }));
      console.log("responseeeeeeee", qrCodeResponse);
      setSeatOption(options);
      //   const seatNumbers = qrCodeResponse?.map((item) =>
      //     parseInt(item.seat_number.split("_").pop())
      //   );
      //   const filteredOptions = options?.filter((option) =>
      //     seatNumbers.includes(parseInt(option.label))
      //   );

      //   setSeatOption(filteredOptions);
    }
  }, [storeData]);

  // const handleSelectChange = (selectedOptions, table_name) => {
  //     console.log('handleSelectChange', selectedOptions, table_name);

  //     setSelectedOption(selectedOptions);
  //     const remainingOptions = seatOptions.filter(option => !selectedOptions.includes(option));
  //     setSeatOption(remainingOptions);
  // };

  const handleSelectChange = (selectedOptions, tableName) => {
    console.log("handleSelectChange", selectedOptions, tableName);
    console.log("qr", qrCodeResponse);

    const updatedTables = storeData[0].tables.map((table) => {
      if (table.table_name === tableName) {
        const updatedTable = { ...table };
        updatedTable.seat_data = [...updatedTable.seat_data];
        const existingSeatNumbers = updatedTable.seat_data.map(
          (seat) => seat.seat_number
        );
        const uniqueSelectedOptions = selectedOptions.filter(
          (option) =>
            !existingSeatNumbers.includes(`seat_number_${option.label}`)
        );

        const newSeats = uniqueSelectedOptions.map((option) => {
          const matchingSeat = qrCodeResponse.find(
            (qrSeat) => qrSeat.seat_number === `seat_number_${option.label}`
          );
          if (matchingSeat) {
            return {
              seat_number: `seat_number_${option.label}`,
              seat_id: matchingSeat?._id,
              qrcode_id: matchingSeat?.qrcode_id,
            };
          }
        });
        updatedTable.seat_data = [...updatedTable.seat_data, ...newSeats];
        console.log("updatedTable", updatedTable);
        return updatedTable;
      }
      return table;
    });

    console.log("updatedTables", updatedTables);
    const updatedStoreData = [{ ...storeData[0], tables: updatedTables }];
    setStoreData(updatedStoreData);

    const dataToPostForUpdatingTables = {
      update_data: {
        tables: updatedTables,
      },
      timezone: currentUser?.userinfo?.timezone,
    };
    const existingIndex = dataToPostForAllPromises.findIndex((item) =>
      Object.keys(item.update_data).includes("tables")
    );

    if (existingIndex !== -1) {
      setDataToPostForAllPromises((prevData) => {
        const newData = [...prevData];
        newData[existingIndex] = dataToPostForUpdatingTables;
        return newData;
      });
    } else {
      setDataToPostForAllPromises((prevData) => [
        ...prevData,
        dataToPostForUpdatingTables,
      ]);
    }
    setSelectedOption(selectedOptions);
    const remainingOptions = seatOptions.filter(
      (option) => !selectedOptions.includes(option)
    );
    setSeatOption(remainingOptions);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleOpenEditModal = () => {
    setShowEditModal(true);
    setIsModalOpen(true);
  };

  const handleOpenMenuModal = () => {
    setShowMenuModal(true);
    setIsModalOpen(true);
  };

  const handleCloseMenuModal = () => {
    setShowMenuModal(false);
  };

  const handleBillGeneratedByChange = (event) => {
    setBillGeneratedBy(event.target.value);

    const dataToPostForUpdatingBill = {
      update_data: {
        bill_genration_by: event.target.value,
      },
      timezone: currentUser?.userinfo?.timezone,
    };

    const existingIndex = dataToPostForAllPromises.findIndex((item) =>
      Object.keys(item.update_data).includes("bill_genration_by")
    );

    if (existingIndex !== -1) {
      setDataToPostForAllPromises((prevData) => {
        const newData = [...prevData];
        newData[existingIndex] = dataToPostForUpdatingBill;
        return newData;
      });
    } else {
      setDataToPostForAllPromises((prevData) => [
        ...prevData,
        dataToPostForUpdatingBill,
      ]);
    }
  };

  const handleStoreNameChange = (event) => {
    setStoreName(event.target.value);
    if (event.target.value !== "") {
      setStoreBtn(false);
    } else {
      setStoreBtn(true);
    }
  };

  const updatStoreName = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      setBtnColor(true);
    }, 2000);
    const dataToPostForUpdatingStoreName = {
      update_data: {
        store_name: storeName,
      },
      timezone: currentUser?.userinfo?.timezone,
    };
    // updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id,getSavedNewUserDetails()[0]._id)
    // setAllPromises(prevPromises => [...prevPromises, updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id, getSavedNewUserDetails()[0]._id, dataToPostForUpdatingStoreName)]);
    const existingIndex = dataToPostForAllPromises.findIndex((item) =>
      Object.keys(item.update_data).includes("store_name")
    );

    if (existingIndex !== -1) {
      setDataToPostForAllPromises((prevData) => {
        const newData = [...prevData];
        newData[existingIndex] = dataToPostForUpdatingStoreName;
        return newData;
      });
    } else {
      setDataToPostForAllPromises((prevData) => [
        ...prevData,
        dataToPostForUpdatingStoreName,
      ]);
    }
  };

  // updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id,getSavedNewUserDetails()[0]._id)
  // setAllPromises(prevPromises => [...prevPromises, updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id, getSavedNewUserDetails()[0]._id, dataToPostForUpdatingStoreName)]);

  const handleIsActiveChange = () => {
    setIsActive(!isActive);
    const dataToPostForUpdatingActiveStatus = {
      update_data: {
        is_active: !isActive,
      },
      timezone: currentUser?.userinfo?.timezone,
    };
    const existingIndex = dataToPostForAllPromises.findIndex((item) =>
      Object.keys(item.update_data).includes("is_active")
    );

    if (existingIndex !== -1) {
      setDataToPostForAllPromises((prevData) => {
        const newData = [...prevData];
        newData[existingIndex] = dataToPostForUpdatingActiveStatus;
        return newData;
      });
    } else {
      setDataToPostForAllPromises((prevData) => [
        ...prevData,
        dataToPostForUpdatingActiveStatus,
      ]);
    }
  };

  const check = () => {
    console.log("promisesssss", dataToPostForAllPromises);
  };

  const handleSaveChangesClick = () => {
    console.log("clicked");
    setIsUpdateLoading(true);

    // updatStoreDataAPI(currentUser?.userinfo?.client_admin_id, storeData[0]._id, getSavedNewUserDetails()[0]._id, dataToPost)
    const promises = dataToPostForAllPromises.map((dataToPost) =>
      updatStoreDataAPI(
        currentUser?.userinfo?.client_admin_id,
        storeData[0]._id,
        getSavedNewUserDetails()[0]._id,
        dataToPost
      )
    );

    Promise.all(promises)
      .then((results) => {
        console.log("All requests succeeded:", results);
        setIsUpdateLoading(false);
      })
      .catch((error) => {
        console.error("Error occurred during requests:", error);
        setIsUpdateLoading(false);
      });
  };

  const new_dt_object = new Date(storeData[0]?.created_at);
  const newformattedDate = new_dt_object.toLocaleDateString("en-GB");

  const checkObject = [
    {
      table_name: "Table 1",
      created_at: "13/03/2024",
      is_active: true,
    },
    {
      table_name: "Table 1",
      created_at: "13/03/2024",
      is_active: true,
    },
    {
      table_name: "Table 1",
      created_at: "13/03/2024",
      is_active: true,
    },
    {
      table_name: "Table 1",
      created_at: "13/03/2024",
      is_active: true,
    },
    {
      table_name: "Table 1",
      created_at: "13/03/2024",
      is_active: true,
    },
    {
      table_name: "Table 1",
      created_at: "13/03/2024",
      is_active: true,
    },
  ];

  return (
    <>
      <div className='w-full h-max p-4 flex flex-wrap items-center justify-evenly'>
        {isLoading ? (
          <CircularProgress />
        ) : (
          // [1,2,3,4,5,6]
          storeData.map((store, index) => {
            return (
              <div
                key={store?._id}
                className='w-[70%] md:w-[400px] h-full bg-[#ecf7ff] p-4 m-2 rounded shadow-xl'
              >
                <div className='w-full flex flex-wrap'>
                  <div className='w-[35%] h-full flex items-center justify-center'>
                    {store?.image_link ? (
                      <img
                        src={store?.image_link}
                        className='w-[100px] h-[100px] rounded'
                      />
                    ) : (
                      <img
                        src='https://nitida.co.za/wp-content/plugins/movedo-extension/assets/images/empty/full.jpg'
                        className='w-[100px] h-[100px] rounded'
                      />
                    )}
                  </div>
                  <div className='w-[60%] p-2 flex flex-col items-left justify-evenly'>
                    <p className='flex items-center justify-start text-lg font-medium'>
                      StoreName:
                      <p className='text-sm font-normal'>
                        {store?.store_name ? store?.store_name : "N/A"}
                      </p>
                    </p>
                    <p className='flex text-lg items-center justify-start text-lg font-medium'>
                      Activity Status:
                      <p className='text-sm font-normal'>
                        {store?.is_active === true ? "OPEN" : "CLOSE"}
                      </p>
                    </p>
                  </div>
                </div>
                <div className='flex items-center p-2 w-full justify-center'>
                  <button
                    className='p-2 bg-orange-200 m-1 rounded px-4 flex items-center justify-center'
                    onClick={handleOpenEditModal}
                  >
                    <CiEdit fontSize={"1.2rem"} />
                    Edit
                  </button>
                  <button
                    className='p-2 bg-sky-200 m-1 rounded px-4 flex items-center justify-center'
                    onClick={handleOpenMenuModal}
                  >
                    <MdViewList fontSize={"1.2rem"} />
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
        {showEditModal ? (
          <Dialog open={isModalOpen} onClose={false} className='w-[100%]'>
            {/* <button onClick={check}>check</button> */}
            <div className='p-4 w-full flex flex-col items-center justify-center rounded'>
              <div className='w-full flex items-center justify-end'>
                <MdCancel
                  fontSize={"1.2rem"}
                  onClick={handleCloseEditModal}
                  color='red'
                />
              </div>
              {
                <div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mt-6'>
                  <div className='mx-2 w-48 h-60 flex flex-col items-center justify-center'>
                    <div className='w-[150px] h-[150px] flex items-center justify-center overflow-hidden rounded'>
                      <img
                        src='https://picsum.photos/id/1/200/300'
                        alt='Store image'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <button className='mt-2 px-4 py-1 bg-gray-200 rounded'>
                      <FaUserEdit
                        className='flex ml-0 text-gray-500 cursor-pointer'
                        size={16}
                        onClick={updatStoreName}
                      />
                    </button>
                  </div>

                  <div className=' flex flex-col justify-start'>
                    <div className='m-1 flex flex-col'>
                      <label
                        htmlFor='storeName'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Store Name
                      </label>
                      <div className='flex items-center justify-center'>
                        <input
                          type='text'
                          id='storeName'
                          className='mt-1 p-1 focus:outline-none focus:border-sky-500 focus:ring-sky-500 border rounded-md block w-full text-sm'
                          value={storeName}
                          onChange={handleStoreNameChange}
                        />
                        <button
                          className='px-4 flex items-center justify-center'
                          disabled={storeBtn}
                          onClick={updatStoreName}
                        >
                          {btnLoading ? (
                            <CircularProgress size={24} color='inherit' />
                          ) : (
                            <IoIosAddCircle
                              className='flex ml-0  cursor-pointer'
                              fontSize={"2rem"}
                              style={{
                                color: btnColor
                                  ? "rgb(34 197 94)"
                                  : " rgb(14 165 233)",
                              }}
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className='m-1 '>
                      <label
                        htmlFor='billGeneratedBy'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Bill Generated By
                      </label>
                      <select
                        id='billGeneratedBy'
                        className='mt-1 px-1 p-1 focus:outline-none focus:border-sky-500 focus:ring-sky-500 border rounded-md block w-full text-sm'
                        value={billGeneratedBy}
                        onChange={handleBillGeneratedByChange}
                      >
                        <option value=''>N/A</option>
                        <option value='MANAGER'>MANAGER</option>
                        <option value='CUSTOMER'>CUSTOMER</option>
                      </select>
                    </div>
                    <div className='m-1'>
                      <label
                        htmlFor='paymentMethod'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Payment Method
                      </label>
                      <select
                        id='paymentMethod'
                        className='mt-1 p-1 px-1 focus:outline-none focus:border-sky-500 focus:ring-sky-500 border rounded-md block w-full text-sm'
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        <option value=''>Select Method...</option>
                        <option value='PHONEPAY'>PHONEPAY</option>
                        <option value='GOOGLEPAY'>GOOGLEPAY</option>
                        <option value='DIRECT_BANK'>DIRECT_BANK</option>
                      </select>
                    </div>
                    <div className='flex items-center justify-start'>
                      <label className='p-2 '>
                        <input
                          type='checkbox'
                          checked={isActive}
                          onChange={handleIsActiveChange}
                          className='mr-2'
                        />
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              }
              <div className='w-full ml-12 text-gray-600 font-semibold'>
                <span className='text-left'>Tables</span>
              </div>
              <div className='w-full flex flex-col items-center justify-center px-6'>
                {storeData[0].tables.map((table, index) => {
                  return (
                    <div
                      key={table}
                      className='w-full h-full bg-[#ecf7ff] p-4 m-2 rounded-lg shadow'
                    >
                      <div className='m-1 mb-2'>
                        <label
                          htmlFor='tableName'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          Table Name:
                        </label>
                        <input
                          type='text'
                          id='tableName'
                          className='p-1 border rounded-md block w-full text-gray-500 bg-gray-100 focus:outline-none focus:border-sky-500 focus:ring-sky-500 '
                          value={table?.table_name}
                          disabled={true}
                        />
                      </div>
                      <div className='m-1 my-2'>
                        <label
                          htmlFor='SeatNo'
                          className='block text-sm font-medium text-gray-700  mb-1'
                        >
                          Seats
                        </label>
                        <Select
                          defaultValue={selectedOption}
                          // onChange={setSelectedOption}
                          // onChange={handleSelectChange}
                          onChange={(selectedOptions) =>
                            handleSelectChange(
                              selectedOptions,
                              table.table_name
                            )
                          }
                          options={seatOptions}
                          isMulti={true}
                        />
                      </div>
                      <label className='flex items-center justify-start m-1'>
                        <input
                          type='checkbox'
                          // checked={isTableActive}
                          // onChange={handleIsTableActiveChange}
                          className='mr-2'
                        />
                        Active
                      </label>
                    </div>
                  );
                })}
              </div>

              <button
                className='bg-green-500 shadow text-white font-semibold px-2 py-1 mt-4 rounded'
                //    onClick={handleSaveChangesClick}
              >
                {isUpdateLoading ? <CircularProgress /> : "Save Changes"}
              </button>
            </div>
          </Dialog>
        ) : (
          <></>
        )}
        {showMenuModal ? (
          <Dialog open={isModalOpen} onClose={false} className='w-[100%]'>
            {/* <button onClick={check}>check</button> */}
            <div className='p-4 w-full flex flex-col items-center justify-center rounded'>
              <div className='w-full flex items-center justify-end'>
                <MdCancel
                  fontSize={"1.2rem"}
                  onClick={handleCloseMenuModal}
                  color='red'
                />
              </div>

              <div className='w-full flex flex-col sm:flex-row items-center sm:items-start justify-start px-6 py-4 gap-4 sm:gap-8 '>
                <div className='p-2'>
                  <div className='w-full  text-gray-900 font-semibold mb-2'>
                    <span className=''>Details</span>
                  </div>
                  <div className='flex gap-x-2 '>
                    <span className='text-sm'>Store Name: </span>
                    <span className='uppercase font-semibold text-base text-gray-600'>
                      {storeData[0]?.store_name}
                    </span>
                  </div>
                  <div className='flex gap-x-2'>
                    <span className='text-sm'>Payment Method: </span>
                    <span className='uppercase font-semibold text-base text-gray-600'>
                      {storeData[0]?.PAYMENT_METHOD}
                    </span>
                  </div>
                  <div className='flex gap-x-2'>
                    <span className='text-sm'>Bill Generated By: </span>
                    <span className='uppercase font-semibold text-base text-gray-600'>
                      {storeData[0]?.bill_genration_by}
                    </span>
                  </div>
                  <div className='flex gap-x-2'>
                    <span className='text-sm'>Created At: </span>
                    <span className='uppercase font-semibold text-base text-gray-600'>
                      {newformattedDate}
                    </span>
                  </div>
                  <div className='flex gap-x-2'>
                    <span className='text-sm'>Active: </span>
                    <span className='uppercase font-semibold text-base text-gray-600'>
                      {storeData[0]?.is_active.toString()}
                    </span>
                  </div>
                </div>
                <div className='w-full sm:w-auto flex flex-col p-2 '>
                  <div className='w-full  text-gray-900 font-semibold'>
                    <span className=''>Tables</span>
                  </div>
                  {storeData[0].tables.map((table, index) => {
                    const dt_object = new Date(table?.created_at);
                    const formattedDate = dt_object.toLocaleDateString("en-GB");
                    return (
                      <div
                        key={table}
                        className='w-full h-full bg-[#ecf7ff] p-4 my-2 rounded-lg shadow'
                      >
                        <div className='flex flex-col'>
                          <div className='flex gap-x-2'>
                            <span className='text-sm'>Table Name: </span>
                            <span className=' font-medium text-base text-gray-600'>
                              {table?.table_name}
                            </span>
                          </div>
                          <div className='flex gap-x-2'>
                            <span className='text-sm'>Created at: </span>
                            <span className=' font-medium text-base text-gray-600'>
                              {formattedDate}
                            </span>
                          </div>
                          <div className='flex gap-x-2'>
                            <span className='text-sm'>Active: </span>
                            <span className='uppercase  text-sm'>
                              {table?.is_active.toString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Dialog>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default StoreDetailsScreen;
