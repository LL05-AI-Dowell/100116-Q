import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, useEffect } from "react";
import "../../App.css";
import Card from "../../Components/Card";
import { IoAddCircleSharp } from "react-icons/io5";
import { createQrCode } from "../../../services/qServices";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import { MdOutlineErrorOutline } from "react-icons/md";

const SeatDetails = () => {
    const user = getSavedNewUserDetails();
    const { currentUser, qrCodeResponse } = useCurrentUserContext();
    const [loading, setLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(false);
    const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);

    useEffect(() => {
        if (qrCodeResponse) {
            setLoading(false);
        }
    }, [qrCodeResponse]);
    // {console.log('URLLLLLL',process.env.Q_APP_URL)}

    const handleAddQrCode = async () => {
        setIsQrCodeLoading(true);
        if (qrCodeResponse.length === 5) {
            setShowBanner(true);
            setIsQrCodeLoading(false);
        }
        const dataToPost = {
            "link": "https://xvr8nq-5173.csb.app/",
            // "link": `https://www.q.uxlivinglab.online/qrlink?view=qrlinks& workspace_id=${currentUser?.userinfo?.client_admin_id}&store_id=${getSavedNewUserDetails()[0].store_ids[0]}`,
            "timezone": currentUser?.userinfo?.timezone,
            "username": currentUser?.userinfo?.username,
        }
        if (qrCodeResponse.length === 0) {
            await createQrCode(currentUser?.userinfo?.client_admin_id, user[0]?._id, 1, dataToPost).then(res => {
                console.log('qr code created', res)
                setIsQrCodeLoading(false);
            }).catch(err => {
                console.log('errrr qr code created', err)
                setIsQrCodeLoading(false);
            })
        }
        if (qrCodeResponse.length > 0 && qrCodeResponse.length <= 5) {
            if (qrCodeResponse.length === 5) return
            const seatNumbers = qrCodeResponse.map(item => parseInt(item.seat_number.split('_')[2]));
            const maxSeatNumber = Math.max(...seatNumbers);
            for (let i = 1; i <= maxSeatNumber; i++) {
                if (!seatNumbers.includes(i)) {
                    return i;
                }
            }
            await createQrCode(currentUser?.userinfo?.client_admin_id, user[0]?._id, maxSeatNumber + 1, dataToPost).then(res => {
                console.log('qr code created', res)
                setIsQrCodeLoading(false);
            }).catch(err => {
                console.log('errrr qr code created', err)
                setIsQrCodeLoading(false);
            })
        }
    }

    return (
        <div>
            {loading ? (
                <div className="loader-container">
                    <CircularProgress />
                </div>
            ) : (
                <>
                    {showBanner ?
                        <div className="border border-orange-400 bg-orange-50 w-max rounded margin_ flex items-center justify-center p-2">
                            <MdOutlineErrorOutline color='#fb923c' fontSize={22} />
                            <p className="text-rose-700 text-base font-light mx-2">Upgrade your account!...<a
                                href='https://www.uxlivinglab.org/'
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700"
                            ><u>Click Here</u></a></p></div> : <></>}
                    <div className="flex items-center justify-between border border-sky-400 rounded w-max px-3 py-0.5 cursor-pointer" onClick={handleAddQrCode}>
                        {
                            isQrCodeLoading ? <CircularProgress size={20} /> :
                                <><p className="text-lg font-light px-2">Add</p>
                                    <IoAddCircleSharp fontSize='1.7rem' color="#38bdf9" position='relative' />
                                </>
                        }
                    </div>
                    <div className="flex flex-wrap overflow-y-scroll">
                        {qrCodeResponse.map(qrCode => (
                            <Card qrCodeResponse={qrCode} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SeatDetails;
