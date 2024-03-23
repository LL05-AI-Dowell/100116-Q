import SvgImageSuccess from "../../assets/success.svg";
import SvgImageFailed from "../../assets/failed.svg";
import CircularProgress from "@mui/material/CircularProgress";
import { updatePaymentRecord } from "../../../services/qServices";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Success = () => {
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };

    const [loading, setLoading] = useState(true);
    const [apiResponse, setApiResponse] = useState({ status: null, data: null });

    const query = useQuery();
    const paymentReceiptId = query.get("payment_receipt_id");
    const workspaceId = query.get("workspace_id");
    const date = query.get("date");
    const qrCodeId = query.get("qrcode_id");
    const seat_number = query.get("seat_number");
    const store_id = query.get("store_id");

    useEffect(() => {
        updatePaymentRecord(paymentReceiptId, date, qrCodeId, workspaceId, seat_number, store_id)
            .then((response) => {
                setApiResponse({ status: response.status, data: response.data });
            })
            .catch((error) => {
                setApiResponse({ status: error.response.status, data: null });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [paymentReceiptId, workspaceId, date, qrCodeId, seat_number, store_id]);

    if (loading) {
        return (
            <div className="loader-container">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="App">
            {apiResponse.status === 200 ? (
                <div>
                    <img src={SvgImageSuccess} alt="success" className="image-svg" />
                    <p>
                        Payment successful. Thank you for dining with us. Please visit
                        again.
                    </p>
                </div>
            ) : (
                <div>
                    <img src={SvgImageFailed} alt="failed" className="image-svg" />
                    <p>Payment failed.</p>
                </div>
            )}
        </div>
    );
}

export default Success;