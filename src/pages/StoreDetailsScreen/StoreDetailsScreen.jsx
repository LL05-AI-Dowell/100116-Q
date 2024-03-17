import { getStoreData } from "../../../services/qServices";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { CiEdit } from "react-icons/ci";
import { MdViewList } from "react-icons/md";
import Dialog from '@mui/material/Dialog';
import { MdCancel } from "react-icons/md";
import TextField from '@mui/material/TextField';


const StoreDetailsScreen = () => {

    const { currentUser } = useCurrentUserContext();
    const [storeData, setStoreData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        getStoreData(currentUser?.userinfo?.client_admin_id).then(res => {
            console.log('get store data ress', res.data);
            setStoreData(res?.data?.response);
            setIsLoading(false);
        }).catch(err => {
            console.log('get store data errrrrr', err);
            setIsLoading(false);
        });
    }, [])

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    }

    const handleOpenEditModal = () => {
        setShowEditModal(true);
        setIsModalOpen(true);
    }

    return (
        <>
            <div className="w-full h-max p-4 flex flex-wrap items-center justify-evenly">
                {
                    isLoading ? <CircularProgress /> :
                        (
                            // [1,2,3,4,5,6]
                            storeData.map((index, store) => {
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
                                                // value={storeName}
                                                // onChange={handleStoreNameChange}
                                                />
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="imageLink" className="block text-sm font-medium text-gray-700">Image Link</label>
                                                <input
                                                    type="text"
                                                    id="imageLink"
                                                    className="mt-1 p-2 border rounded-md block w-full"
                                                // value={imageLink}
                                                // onChange={handleImageLinkChange}
                                                />
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="billGeneratedBy" className="block text-sm font-medium text-gray-700">Bill Generated By</label>
                                                <input
                                                    type="text"
                                                    id="billGeneratedBy"
                                                    className="mt-1 p-2 border rounded-md block w-full"
                                                // value={billGeneratedBy}
                                                // onChange={handleBillGeneratedByChange}
                                                />
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                                                <input
                                                    type="text"
                                                    id="paymentMethod"
                                                    className="mt-1 p-2 border rounded-md block w-full"
                                                // value={paymentMethod}
                                                // onChange={handlePaymentMethodChange}
                                                />
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="sessionStartsBy" className="block text-sm font-medium text-gray-700">Session Starts By</label>
                                                <input
                                                    type="text"
                                                    id="sessionStartsBy"
                                                    className="mt-1 p-2 border rounded-md block w-full"
                                                // value={sessionStartsBy}
                                                // onChange={handleSessionStartsByChange}
                                                />
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">Created At</label>
                                                <input
                                                    type="text"
                                                    id="createdAt"
                                                    className="mt-1 p-2 border rounded-md block w-full"
                                                // value={createdAt}
                                                // onChange={handleCreatedAtChange}
                                                />
                                            </div>
                                            <div className="m-1">
                                                <label htmlFor="updatedAt" className="block text-sm font-medium text-gray-700">Updated At</label>
                                                <input
                                                    type="text"
                                                    id="updatedAt"
                                                    className="mt-1 p-2 border rounded-md block w-full"
                                                // value={updatedAt}
                                                // onChange={handleUpdatedAtChange}
                                                />
                                            </div>
                                            <label className="flex items-center justify-center m-1">
                                                <input
                                                    type="checkbox"
                                                    // checked={isActive}
                                                    // onChange={handleIsActiveChange}
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
                                            storeData[0].tables.map((index, store) => {
                                                return (
                                                    <div key={store} className="w-[43%] h-full bg-[#ecf7ff] p-4 m-2 rounded shadow-xl">
                                                        <div className="m-1">
                                                            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Table Name:</label>
                                                            <input
                                                                type="text"
                                                                id="storeName"
                                                                className="p-1 border rounded-md block w-full"
                                                            // value={storeName}
                                                            // onChange={handleStoreNameChange}
                                                            />
                                                        </div>
                                                        <div className="m-1">
                                                            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Seats</label>
                                                            <input
                                                                type="text"
                                                                id="storeName"
                                                                className="mt-1 p-1 border rounded-md block w-full"
                                                            // value={storeName}
                                                            // onChange={handleStoreNameChange}
                                                            />
                                                        </div>
                                                        <div className="m-1">
                                                            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Created At</label>
                                                            <input
                                                                type="text"
                                                                id="storeName"
                                                                className="mt-1 p-1 border rounded-md block w-full"
                                                            // value={storeName}
                                                            // onChange={handleStoreNameChange}
                                                            />
                                                        </div>
                                                        <label className="flex items-center justify-center m-1">
                                                            <input
                                                                type="checkbox"
                                                                // checked={isActive}
                                                                // onChange={handleIsActiveChange}
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