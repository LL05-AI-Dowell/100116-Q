import { MdArrowBackIos } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import SeatDetails from "./SeatDetails";
import UserDetailsScreen from "../UserDetailsScreen/UserDetailsScreen";

const Profile = () => {
    const navigate = useNavigate();
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <div className="h-screen m-0 p-0 gradient_ flex items-baseline">
                <div className="w-full h-full bg-white margin_ shadow-black mt-3.5 p-4 pt-2 pb-6 rounded-md md:w-11/12 md:h-max">
                    <div className="w-full flex items-start justify-between x">
                        <MdArrowBackIos onClick={() => navigate(-1)} className="text-2xl cursor-pointer my-4 mx-3" />
                        <Box sx={{ width: '90%', typography: 'body1', }}>
                            <TabContext value={value}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                                        <Tab label="USER DETAILS" value="1" />
                                        <Tab label="STORE DETAILS" value="2" />
                                        <Tab label="SEAT INFORMATION" value="3" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1">{<UserDetailsScreen />}</TabPanel>
                                <TabPanel value="2">Store Details</TabPanel>
                                <TabPanel value="3">{<SeatDetails />}</TabPanel>
                            </TabContext>
                        </Box>
                        <img
                            src="https://i.pinimg.com/736x/f8/66/8e/f8668e5328cfb4938903406948383cf6.jpg"
                            alt="Profile Photo"
                            className="h-10 w-10 rounded-full shadow-2xl mx-10 cursor-pointer"
                        // onClick={() => navigate('/profile')}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile;