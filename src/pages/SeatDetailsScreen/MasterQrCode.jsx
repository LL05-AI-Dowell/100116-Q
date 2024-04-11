import { IoAddCircleSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import { retrieveMasterQr, createMasterQrCode } from "../../../services/qServices";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import { getTimeZone } from "../../helpers/helpers";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "../../Components/Card";

const MasterQrCode = () => {
    const { currentUser, masterQrCodeCreated, setMasterQrCodeCreated } =
        useCurrentUserContext();
    const [qrCodeNotCreated, setQrCodeNotCreated] = useState(false);
    const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);

    useEffect(() => {
        if (masterQrCodeCreated) return
        retrieveMasterQr(currentUser?.userinfo?.client_admin_id, getSavedNewUserDetails()[0]?._id).then((res) => {
            console.log('master qr code responseeeeeeeeeeee',res?.data?.response);
            if (res?.data?.response?.length === 0) {
                setQrCodeNotCreated(true);
            } else {
                setMasterQrCodeCreated(res?.data?.response);
            }
        })
            .catch((err) => {

            })
    }, [])

    const handleAddQrCode = async () => {
        setIsQrCodeLoading(true);
        const dataToPost = {
            "link": "http://localhost:5173/onlineshoplink/?",
            "timezone": currentUser?.userinfo?.timezone ? currentUser?.userinfo?.timezone : getTimeZone(),
            "username": currentUser?.userinfo?.username,
        }
        await createMasterQrCode(
            currentUser?.userinfo?.client_admin_id,
            getSavedNewUserDetails()[0]?._id,
            getSavedNewUserDetails()[0]?.store_ids?.online_store_id,
            dataToPost,
        ).then((res) => {
            toast.success('Master Qr Code created successfully');
            setQrCodeNotCreated(false);
        }).catch((err) => {
            toast.error('Error creating Master Qr Code, Please try again.');
        }).finally(() => {
            setIsQrCodeLoading(false);
        });
    }

    return (
        <>
            {
                qrCodeNotCreated ?
                    (
                        <div
                            className='flex items-center justify-between border border-sky-400 rounded w-max px-3 py-0.5 cursor-pointer'
                            onClick={handleAddQrCode}
                        >
                            {isQrCodeLoading ? (
                                <CircularProgress size={20} />
                            ) : (
                                <>
                                    <p className='text-lg font-light px-2'>Add</p>
                                    <IoAddCircleSharp
                                        fontSize='1.7rem'
                                        color='#38bdf9'
                                        position='relative'
                                    />
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                        {
                            // display master qr code card
                           <p>{masterQrCodeCreated[0]?.qrcode_name}</p>
                        }
                        </>
                    )
            }
        </>
    )
}

export default MasterQrCode;