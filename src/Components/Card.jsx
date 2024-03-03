import { useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { format } from "date-fns";
import "./styles.css";


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
    <Card className="card">
      <div className="qr-code-container" onClick={handleImageClick}>
        <Avatar
          className="enlarged-image"
          alt="QR Code"
          src={qrCodeResponse.qrcode_image_url}
        />
      </div>
      <CardContent className="content">
        <Typography variant="h5" component="h2" className="title">
          {qrCodeResponse.qrcode_name}
        </Typography>
        <Typography variant="body1" component="p">
          Seat Number: {qrCodeResponse.seat_number}
        </Typography>
        <Typography variant="body1" component="p">
          Shorthand URL:{" "}
          <a
            href={qrCodeResponse.shorthand_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shorthand-url"
          >
            {qrCodeResponse.shorthand_url}
          </a>
        </Typography>
        <Typography variant="body1" component="p">
          Created At: {formattedCreatedAt}
        </Typography>
        {qrCodeResponse.is_active ? (
          <Button
            variant="contained"
            color="secondary"
            className="button"
          >
            Deactivate
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            className="button"
          >
            Activate
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CardDetails;