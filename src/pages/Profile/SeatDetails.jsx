import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, useEffect } from "react";
import "../../App.css";
import Card from "../../Components/Card";

const SeatDetails = () => {
    const { qrCodeResponse } = useCurrentUserContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (qrCodeResponse) {
            setLoading(false);
        }
    }, [qrCodeResponse]);

    return (
        <div>
            {loading ? (
                <div className="loader-container">
                    <CircularProgress />
                </div>
            ) : (
                <div className="flex flex-row gap-0.5">
                    {qrCodeResponse.map(qrCode=> (
                        <Card qrCodeResponse={qrCode} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeatDetails;
