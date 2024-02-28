import React, { useState, useEffect } from "react";
import {
    Button,
    CircularProgress,
    Modal,
    Snackbar,
    IconButton,
} from "@mui/material";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const API_URLS = [
    {
        url: "https://100090.pythonanywhere.com/get_data/?type=user_data",
        name: "Getting user data",
    },
    {
        url: "https://100090.pythonanywhere.com/get_data/?type=setup_datacube",
        name: "Setting up datacube",
    },
    {
        url: "https://100090.pythonanywhere.com/get_data/?type=setup_collection",
        name: "Setting up collection",
    },
    {
        url: "https://100090.pythonanywhere.com/get_data/?type=saving_user_data",
        name: "Saving user to collection",
    },
    {
        url: "https://100090.pythonanywhere.com/get_data/?type=create_qrcode",
        name: "Creating QR code",
    },
];

const StepModal = ({ onCompletion }) => {
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        if (open && step < 5) {
            setLoading(true);
            setTimeout(() => {
                axios
                    .get(API_URLS[step].url)
                    .then((response) => {
                        setLoading(false);
                        if (response.data.success) {
                            setSnackbarMessage(response.data.message);
                            setSnackbarOpen(true);
                            setTimeout(() => {
                                setStep((prevStep) => prevStep + 1);
                            }, 1000); // Wait for 1 second after API response
                        } else {
                            setSnackbarMessage("API call failed. Process stopped.");
                            setSnackbarOpen(true);
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        setSnackbarMessage("Error occurred. Process stopped.");
                        setSnackbarOpen(true);
                        setLoading(false);
                    });
            }, 1000);
        } else if (step === 5) {
            onCompletion();
        }
    }, [open, step]);

    const handleClose = () => {
        setOpen(false);
        onClose();
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div>
            {/* <Button onClick={handleOpen}>Open Modal</Button> */}
            <Modal
                open={open}
                onClose={handleClose}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        width: 300,
                        backgroundColor: "white",
                        padding: 20,
                        borderRadius: 8,
                        fontFamily: "Arial, sans-serif",
                        fontSize: 16,
                    }}
                >
                    <h2>Setting up Q app for you</h2>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {API_URLS.map((stepData, index) => (
                            <li key={index} style={{ display: "flex", alignItems: "center" }}>
                                <div style={{ flex: 1 }}>
                                    {step === index && loading ? (
                                        <CircularProgress size={20} />
                                    ) : step > index ? (
                                        <CheckCircleIcon style={{ color: "green" }} />
                                    ) : null}
                                </div>
                                <div style={{ flex: 5 }}>{stepData.name}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </Modal>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </div>
    );
};

export default StepModal;