import { useEffect, useState } from "react";
import { retrieveMasterQr } from "../../../services/qServices";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import CircularProgress from "@mui/material/CircularProgress";
import { format } from "date-fns";

const SeatMaster = () => {
  const { currentUser } = useCurrentUserContext();
  const user = getSavedNewUserDetails();
  const [loading, setLoading] = useState(false);
  const [imageLink, setImageLink] = useState(null);
  const [shortHandUrl, setShortHandUrl] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [isActive, setSetActive] = useState(false);

  useEffect(() => {
    const getMasterQrCodeFunc = async () => {
      setLoading(true);
      await retrieveMasterQr(
        currentUser?.userinfo?.client_admin_id,
        user[0]?._id
      )
        .then((res) => {
          setImageLink(res?.data?.response[0].shorthand_url);
          setShortHandUrl(res?.data?.response[0].qrcode_image_url);
          setSetActive(res?.data?.response[0].is_active);

          const formattedCreatedAt = format(
            new Date(res?.data?.response[0].created_at),
            "yyyy-MM-dd HH:mm:ss"
          );

          setCreatedAt(formattedCreatedAt);

          setLoading(false);
        })
        .catch((err) => {
          console.log("errrr qr code created", err);
          setLoading(false);
        });
    };

    getMasterQrCodeFunc();
  }, []);

  return (
    <div>
      {loading ? (
        <div className='loader-container'>
          <CircularProgress />
        </div>
      ) : (
        <div className='w-full md:w-[500px] flex flex-col sm:flex-row items-start justify-center rounded-lg shadow-lg p-4 gap-x-4 '>
          <div className='w-full h-[200px] flex items-center justify-center bg-slate-300'>
            <img
              src={imageLink}
              alt='Profile Photo'
              className='h-max w-full shadow-5xl mx-2'
            />
          </div>

          <div className=' w-full h-[200px] flex flex-col items-start justify-center p-2 gap-y-2'>
            <span className='text-sm'>
              Shorthand url:{" "}
              <a
                href={shortHandUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-700'
              >
                <u>Click here!</u>
              </a>
            </span>
            <span className='text-sm'>{`Created at:${" "} ${
              createdAt ?? ""
            }`}</span>
            <span className='text-sm'>{`Is Active:${" "} ${isActive}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMaster;
