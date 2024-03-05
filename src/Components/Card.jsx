import { useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { format } from "date-fns";
import { qrCodeActivationDeactivation } from "../../services/qServices";
import { useNavigate } from 'react-router-dom';
import {
  CircularProgress
} from "@mui/material";
import { getQrCode } from "../../services/qServices";
import { getSavedNewUserDetails } from "../hooks/useDowellLogin";
import { useCurrentUserContext } from "../contexts/CurrentUserContext";

const CardDetails = ({ qrCodeResponse }) => {
  const { currentUser, setQrCodeResponse } = useCurrentUserContext()
  const [isImageClicked, setIsImageClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageClick = () => {
    setIsImageClicked(!isImageClicked);
  };

  const handleGetQrCode = async () => {
    await getQrCode(currentUser?.userinfo?.client_admin_id, getSavedNewUserDetails()[0]?._id).then(async (res) => {
      setQrCodeResponse(res?.data?.response);
    }).catch(err => {
      console.log('error qr code retrieval', err);
      if (err?.response?.status === 400) {
        navigate('/error');
      }
    })
  }

  const formattedCreatedAt = format(
    new Date(qrCodeResponse?.created_at),
    "yyyy-MM-dd HH:mm:ss"
  );

  const handleActivateDeactivateClick = async (status) => {
    setIsLoading(true);
    console.log('>>>>>>>>>>', qrCodeResponse.workspace_id, qrCodeResponse._id, status);
    await qrCodeActivationDeactivation(qrCodeResponse.workspace_id, qrCodeResponse._id, status).then(res => {
      console.log('res qr activateion de activation', res);
      handleGetQrCode();
      setIsLoading(false);
    }).catch(err => {
      console.log('err qr activateion de activation', err);
      setIsLoading(false);
      if (err?.response?.status === 400) {
        navigate('/error');
      }
    })
  }

  const changeName = (name) => {
    let parts = name.split('_');

    if (parts.length >= 3) {
      let result = '';
      for (let i = 0; i < parts.length - 1; i++) {
        result += parts[i] + ' ';
      }
      result += parts[parts.length - 1];
      return result;
    } else if (parts.length === 2) {
      return parts.join(' ');
    } else {
      return 'Invalid input format';
    }
  }

  return (
    <Card sx={{ display: 'flex', width: '46%', margin: '1rem', padding: '0.9%' }}>
      <div className="w-2/5 flex items-center justify-center" onClick={handleImageClick}>
        <img
          src={qrCodeResponse.qrcode_image_url}
          alt="Profile Photo"
          className="h-max w-full shadow-5xl mx-2"
        />
      </div>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'left' }}>
        <Typography variant="h6" component="h6" sx={{ fontSize: '1.3rem', textAlign: 'left', margin: '5px' }}>
          {changeName(qrCodeResponse.qrcode_name)}
        </Typography>
        <Typography variant="body1" component="p" sx={{ textAlign: 'left', display: 'flex', alignItems: 'center', margin: '5px' }}>
          <p className="mx-0.5 text-sm">Seat Number:</p><p className="font-light">{changeName(qrCodeResponse.seat_number)}</p>
        </Typography>
        <Typography variant="body1" component="p" sx={{ textAlign: 'left', display: 'flex', alignItems: 'center', margin: '5px' }}>
          <p className="mx-0.5 text-sm">SeatShorthand URL:</p>
          <a
            href={qrCodeResponse.shorthand_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700"
          >
            <u>Click here!</u>
          </a>
        </Typography>
        <Typography variant="body1" component="p" sx={{ textAlign: 'left', display: 'flex', alignItems: 'center', margin: '5px' }}>
          <p className="mx-0.5 text-sm">Created At:</p> <p className="font-light">{formattedCreatedAt}</p>
        </Typography>
        {qrCodeResponse.is_active ? (

          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleActivateDeactivateClick(false)}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Close'}
          </Button>
        ) : (

          <Button
            variant="contained"
            color="primary"
            onClick={() => handleActivateDeactivateClick(true)}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Open'}
          </Button>
        )}
      </CardContent>

    </Card>
  );
};

export default CardDetails;