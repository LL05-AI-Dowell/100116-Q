import { IoAddCircleSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import {
  retrieveMasterQr,
  createMasterQrCode,
} from "../../../services/qServices";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import { getTimeZone } from "../../helpers/helpers";
import { toast } from "react-toastify";
import { format } from "date-fns";
import CircularProgress from "@mui/material/CircularProgress";

const MasterQrCode = () => {
  const { currentUser, masterQrCodeCreated, setMasterQrCodeCreated } =
    useCurrentUserContext();
  const [qrCodeNotCreated, setQrCodeNotCreated] = useState(false);
  const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);

  useEffect(() => {
    if (masterQrCodeCreated) return;
    retrieveMasterQr(
      currentUser?.userinfo?.client_admin_id,
      getSavedNewUserDetails()[0]?._id
    )
      .then((res) => {
        console.log("master qr code responseeeeeeeeeeee", res?.data?.response);
        if (res?.data?.response?.length === 0) {
          setQrCodeNotCreated(true);
        } else {
          setMasterQrCodeCreated(res?.data?.response);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const handleAddQrCode = async () => {
    setIsQrCodeLoading(true);
    const dataToPost = {
      link: "http://localhost:5173/onlineshoplink/?",
      timezone: currentUser?.userinfo?.timezone
        ? currentUser?.userinfo?.timezone
        : getTimeZone(),
      username: currentUser?.userinfo?.username,
    };
    await createMasterQrCode(
      currentUser?.userinfo?.client_admin_id,
      getSavedNewUserDetails()[0]?._id,
      getSavedNewUserDetails()[0]?.store_ids?.online_store_id,
      dataToPost
    )
      .then((res) => {
        toast.success("Master Qr Code created successfully");
        setQrCodeNotCreated(false);
      })
      .catch((err) => {
        toast.error("Error creating Master Qr Code, Please try again.");
      })
      .finally(() => {
        setIsQrCodeLoading(false);
      });
  };

  const formattedCreatedAt = format(
    new Date(masterQrCodeCreated[0].created_at),
    "yyyy-MM-dd HH:mm:ss"
  );

  console.debug("master c date", masterQrCodeCreated);

  return (
    <>
      {qrCodeNotCreated ? (
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
          <div className='w-full md:w-[500px] flex flex-col sm:flex-row items-start justify-center rounded-lg shadow-lg p-4 gap-x-4 '>
            <div className='w-full h-[200px] flex items-center justify-center'>
              <img
                src={masterQrCodeCreated[0].qrcode_image_url}
                alt='Profile Photo'
                className='h-max w-full shadow-5xl mx-2'
              />
            </div>

            <div className=' w-full h-[200px] flex flex-col items-start justify-center p-2 gap-y-2'>
              <span className='text-sm'>
                Shorthand url:{" "}
                <a
                  href={masterQrCodeCreated[0].shorthand_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-700'
                >
                  <u>Click here!</u>
                </a>
              </span>
              <span className='text-sm'>{`Created at:${" "} ${formattedCreatedAt}`}</span>
              <span className='text-sm'>{`Is Active:${" "} ${
                masterQrCodeCreated[0].is_active
              }`}</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MasterQrCode;
