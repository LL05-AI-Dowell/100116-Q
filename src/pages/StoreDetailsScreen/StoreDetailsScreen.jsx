import { getStoreData } from "../../../services/qServices";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { CiEdit } from "react-icons/ci";
import { MdViewList } from "react-icons/md";
import Dialog from "@mui/material/Dialog";
import { MdCancel } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
// import TextField from '@mui/material/TextField';

const StoreDetailsScreen = () => {
  const { currentUser } = useCurrentUserContext();
  const [storeData, setStoreData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getStoreData(currentUser?.userinfo?.client_admin_id)
      .then((res) => {
        console.log("get store data ress", res.data);
        setStoreData(res?.data?.response);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("get store data errrrrr", err);
        setIsLoading(false);
      });
  }, []);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleOpenEditModal = () => {
    setShowEditModal(true);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='w-full h-max p-4 flex flex-wrap items-center'>
        {isLoading ? (
          <CircularProgress />
        ) : (
          storeData.map((index, store) => {
            return (
              <div
                key={store?._id}
                className='w-[70%] md:w-[43%] h-full bg-[#ecf7ff] p-4 m-2 rounded shadow-xl'
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
                    <p className='flex  items-center justify-start text-lg font-medium'>
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
                  <button className='p-2 bg-sky-200 m-1 rounded px-4 flex items-center justify-center'>
                    <MdViewList fontSize={"1.2rem"} />
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
        {showEditModal ? (
          <Dialog open={isModalOpen} onClose={false} className=' w-[100%]'>
            <div className='bg-gray-200 px-3 py-1'>
              <div className='my-2 py-2  '>
                <div className='w-full flex items-center justify-between '>
                  <span className='text-center font-semibold'>Store 1</span>
                  <MdCancel
                    fontSize={"1.2rem"}
                    onClick={handleCloseEditModal}
                    color='red '
                    className='cursor-pointer'
                  />
                </div>
              </div>
              <div className='w-full flex flex-col gap-3'>
                <div className='block gap-2 sm:flex sm:items-start sm:justify-between'>
                  {/* first div */}
                  <div className='mx-5 bg-white rounded-lg h-[150px] w-[170px] text-sm mb-16 sm:mb-0'>
                    <div className=' flex items-center justify-center'>
                      <img
                        src='https://picsum.photos/id/1/200/300'
                        alt='Store img'
                        className='h-[150px] w-[210px] overflow-hidden rounded object-fill'
                      />
                    </div>
                    <div className='my-4  flex items-center justify-center'>
                      <button className='bg-gray-400 px-2 py-1 rounded'>
                        Edit <FaUserEdit className='inline ' />{" "}
                      </button>
                    </div>
                  </div>
                  {/* second div */}
                  <div className='w-[320px]'>
                    <div className='mb-1 flex items-center justify-between'>
                      <label
                        htmlFor='storeName'
                        className=' block text-sm font-medium text-gray-700 '
                      >
                        Store Name
                      </label>
                      <input
                        type='text'
                        id='storeName'
                        className='mt-1 p-1 border rounded-md block '
                        // value={storeName}
                        // onChange={handlestoreNameChange}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-start gap-8'>
                      <label
                        htmlFor='imageLink'
                        className='block text-sm font-medium text-gray-700 '
                      >
                        Activity Status:
                      </label>
                      <span>Open</span>
                      <input
                        type='checkbox'
                        // checked={isChecked}
                        // onChange={toggleSwitch}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between'>
                      <label
                        htmlFor='imageLink'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Image Link
                      </label>
                      <input
                        type='text'
                        id='imageLink'
                        className='mt-1 p-1 border rounded-md block'
                        // value={imageLink}
                        // onChange={handleImageLinkChange}
                      />
                    </div>
                    <div className='m-1 mt-2 flex items-center justify-between'>
                      <label
                        htmlFor='paymentMethod'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Bill Generated By
                      </label>
                      <select
                        defaultValue='N/A'
                        className='w-[190px] p-1 rounded'
                      >
                        <option value='N/A'>N/A</option>
                        <option value='manager'>MANAGER</option>
                        <option value='customer'>CUSTOMER</option>
                      </select>
                    </div>
                    <div className='m-1 flex items-center justify-between'>
                      <label
                        htmlFor='sessionStartsBy'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Session Starts By
                      </label>
                      <input
                        type='text'
                        id='sessionStartsBy'
                        className='mt-1 p-1 border rounded-md block'
                        // value={sessionStartsBy}
                        // onChange={handleSessionStartsByChange}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between'>
                      <label
                        htmlFor='createdAt'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Payment Method
                      </label>
                      <select
                        defaultValue='N/A'
                        className='w-[190px] p-1 rounded mt-1'
                      >
                        <option value='N/A'>N/A</option>
                        <option value='phonePay'>PHONEPAY</option>
                        <option value='googlePlay'>GOOGLEPAY</option>
                        <option value='directBank'>DIRECT_BANK</option>
                      </select>
                    </div>
                    <div className='m-1 flex items-center justify-between'>
                      <label
                        htmlFor='createdAt'
                        className=' block text-sm font-medium text-gray-700'
                      >
                        Created At
                      </label>
                      <input
                        type='text'
                        id='createdAt'
                        className='mt-1 p-1 border rounded-md block'
                        // value={updatedAt}
                        // onChange={handleCreatedAtChange}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between'>
                      <label
                        htmlFor='updatedAt'
                        className=' block text-sm font-medium text-gray-700'
                      >
                        Updated At
                      </label>
                      <input
                        type='text'
                        id='updatedAt'
                        className='mt-1 p-1 border rounded-md block'
                        // value={updatedAt}
                        // onChange={handleUpdatedAtChange}
                      />
                    </div>
                  </div>
                </div>
                <div className='my-2 flex items-center justify-start'>
                  <span>Tables:</span>
                </div>

                <div className='block m-3 gap-2 sm:gap-4 sm:flex sm:items-center sm:justify-center sm:m-0'>
                  <div className='bg-white rounded '>
                    <div className='m-1 flex items-center justify-between gap-3'>
                      <label
                        htmlFor='tableName'
                        className=' block text-sm font-medium text-gray-700 '
                      >
                        Table Name
                      </label>
                      <input
                        type='text'
                        id='imageLink'
                        className='mt-2 p-1 border rounded-md block w-[170px] bg-gray-200'
                        // value={tableName}
                        // onChange={handleTableNameChange}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between  sm:justify-start gap-8'>
                      <label
                        htmlFor='imageLink'
                        className='block text-sm font-medium text-gray-700 '
                      >
                        Activity Status:
                      </label>
                      <span>Open</span>
                      <input
                        type='checkbox'
                        className='bg-gray-200'
                        // checked={isChecked}
                        // onChange={toggleSwitch}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between'>
                      <label
                        htmlFor='createdAt'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Seats
                      </label>
                      <select
                        defaultValue='N/A'
                        className='w-[170px] p-1 rounded mt-1 bg-gray-200'
                      >
                        <option value='N/A'>N/A</option>
                        <option value='option1'>option1</option>
                        <option value='option2'>option2</option>
                      </select>
                    </div>
                    <div className='m-1 flex items-center justify-between gap-3'>
                      <label
                        htmlFor='createdAt'
                        className=' block text-sm font-medium text-gray-700 '
                      >
                        Created At
                      </label>
                      <input
                        type='date'
                        id='createdAt'
                        className='mt-1 p-1 border rounded-md block w-[170px] bg-gray-200'
                        // value={createdAt}
                        // onChange={handleCreatedAtChange}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between gap-3'>
                      <label
                        htmlFor='updatedAt'
                        className=' block text-sm font-medium text-gray-700 '
                      >
                        Updated At
                      </label>
                      <input
                        type='date'
                        id='imageLink'
                        className='mt-1 mb-2 p-1 border rounded-md block w-[170px] bg-gray-200'
                        // value={updatedAt}
                        // onChange={handleUpdatedAtChange}
                      />
                    </div>
                  </div>

                  <div className='bg-white rounded mt-2 sm:mt-0'>
                    <div className='m-1 flex items-center justify-between gap-3'>
                      <label
                        htmlFor='tableName'
                        className=' block text-sm font-medium text-gray-700 '
                      >
                        Table Name
                      </label>
                      <input
                        type='text'
                        id='imageLink'
                        className='mt-2 p-1 border rounded-md block w-[170px] bg-gray-200 '
                        // value={tableName}
                        // onChange={handleTableNameChange}
                      />
                    </div>
                    <div className='m-1 flex items-center  justify-between  sm:justify-start gap-8'>
                      <label
                        htmlFor='imageLink'
                        className='block text-sm font-medium text-gray-700 '
                      >
                        Activity Status:
                      </label>
                      <span>Open</span>
                      <input
                        type='checkbox'
                        className='bg-gray-200'
                        // checked={isChecked}
                        // onChange={toggleSwitch}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between'>
                      <label
                        htmlFor='createdAt'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Seats
                      </label>
                      <select
                        defaultValue='N/A'
                        className='w-[170px] p-1 rounded mt-1 bg-gray-200'
                      >
                        <option value='N/A'>N/A</option>
                        <option value='option1'>option1</option>
                        <option value='option2'>option2</option>
                      </select>
                    </div>
                    <div className='m-1 flex items-center justify-between gap-3'>
                      <label
                        htmlFor='createdAt'
                        className=' block text-sm font-medium text-gray-700 '
                      >
                        Created At
                      </label>
                      <input
                        type='date'
                        id='createdAt'
                        className='mt-1 p-1 border rounded-md block w-[170px] bg-gray-200'
                        // value={createdAt}
                        // onChange={handleCreatedAtChange}
                      />
                    </div>
                    <div className='m-1 flex items-center justify-between gap-3'>
                      <label
                        htmlFor='updatedAt'
                        className=' block text-sm font-medium text-gray-700 '
                      >
                        Updated At
                      </label>
                      <input
                        type='date'
                        id='imageLink'
                        className='mt-1 mb-2 p-1 border rounded-md block w-[170px] bg-gray-200'
                        // value={updatedAt}
                        // onChange={handleUpdatedAtChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='my-8  flex items-center justify-center'>
                <button className='bg-green-600 text-white font-semibold px-2 py-1 rounded'>
                  Submit Changes
                </button>
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
