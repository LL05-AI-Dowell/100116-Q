import { useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { format } from "date-fns";
// import "./styles.css";


const CardDetails = ({ qrCodeResponse }) => {
  const [isImageClicked, setIsImageClicked] = useState(false);

  const handleImageClick = () => {
    setIsImageClicked(!isImageClicked);
  };
  const formattedCreatedAt = format(
    new Date(qrCodeResponse?.created_at),
    "yyyy-MM-dd HH:mm:ss"
  );

  return (
    <Card sx={{ display: 'flex', width: '46%', margin: '1rem', padding: '0.9%' }}>
      <div className="w-2/5 flex" onClick={handleImageClick}>
        <img
          src={qrCodeResponse.qrcode_image_url}
          alt="Profile Photo"
          className="h-max w-full shadow-5xl mx-2"
        />
      </div>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'left' }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '2rem', textAlign: 'left' }}>
          {qrCodeResponse.qrcode_name}
        </Typography>
        <Typography variant="body1" component="p" sx={{ textAlign: 'left', display: 'flex', margin: '5px' }}>
          <p className="mx-0.5 text-sm">Seat Number:</p>{qrCodeResponse.seat_number}
        </Typography>
        <Typography variant="body1" component="p" sx={{ textAlign: 'left', display: 'flex', margin: '5px' }}>
          <p className="mx-0.5 text-sm">SeatShorthand URL:{" "}</p>
          <a
            href={qrCodeResponse.shorthand_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shorthand-url"
          >
            Click here!
          </a>
        </Typography>
        <Typography variant="body1" component="p" sx={{ textAlign: 'left', display: 'flex', margin: '5px' }}>
          <p className="mx-0.5 text-sm">Created At:</p> {formattedCreatedAt}
        </Typography>
        {qrCodeResponse.is_active ? (
          <Button
            variant="contained"
            color="secondary"
          >
            Deactivate
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
          >
            Activate
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CardDetails;