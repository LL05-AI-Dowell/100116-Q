import { MdArrowBackIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import SeatDetails from "./SeatDetails";
import UserDetailsScreen from "../UserDetailsScreen/UserDetailsScreen";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import Button from "@mui/material/Button";
import { userAuth } from "../../../services/qServices";
import { CircularProgress } from "@mui/material";
import StoreDetailsScreen from "../StoreDetailsScreen/StoreDetailsScreen";
import MenuScreen from "../MenuScreen/MenuScreen";

const Profile = () => {
  const { currentUser } = useCurrentUserContext();
  const navigate = useNavigate();
  const [value, setValue] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState(currentUser?.userinfo?.username);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [incorrectPassword, setIncorrectPassword] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleAuthClick = async () => {
    setIncorrectPassword(false);
    console.log(username, password);
    setIsLoading(true);
    await userAuth({
      username: username,
      password: password,
    })
      .then((res) => {
        setIsLoading(false);
        setIsModalOpen(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setIncorrectPassword(true);
      });
  };

  return (
    <>
      <Dialog
        open={isModalOpen}
        onClose={false}
        sx={{ width: "100%" }}
        // className="border border-sky-300 shadow rounded-md p-4 max-w-sm w-full sm:w-2/4 h-max mx-auto item-center margin_ bg-white"
      >
        <div className='p-4 w-full flex flex-col items-center justify-center'>
          <DialogTitle sx={{ fontSize: "25px", fontWeight: "900" }}>
            Login
          </DialogTitle>
          <div className='mb-4 mx-8'>
            <TextField
              label='Username'
              variant='outlined'
              fullWidth
              value={username}
              onChange={handleUsernameChange}
              sx={{ width: "100%" }}
              disabled={true}
            />
          </div>
          <div className='mb-4 mx-8'>
            <TextField
              type='password'
              label='Password'
              variant='outlined'
              fullWidth
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          {incorrectPassword ? (
            <div className='mb-4 mx-8'>
              <p className='text-red-500'>Incorrect password</p>
            </div>
          ) : null}
          <div className='mb-4'>
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleAuthClick()}
            >
              {isLoading ? <CircularProgress size={20} /> : "Enter"}
              {/* Enter */}
            </Button>
          </div>
        </div>
      </Dialog>
      <div className='h-screen m-0 p-0 gradient_ flex items-baseline overflow-scroll'>
        <div className='w-full h-full bg-white margin_ shadow-black mt-3.5 p-4 pt-2 pb-6 rounded-md md:w-11/12 md:h-max'>
          <div className='w-full flex items-start justify-between x'>
            <MdArrowBackIos
              onClick={() => navigate(-1)}
              className='text-2xl cursor-pointer my-4 mx-3'
            />
            <Box sx={{ width: "98%", typography: "body1" }}>
              <TabContext value={value}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TabList
                    onChange={handleChange}
                    aria-label='lab API tabs example'
                  >
                    <Tab label='USER DETAILS' value='3' />
                    <Tab label='STORE DETAILS' value='2' />
                    <Tab label='SEAT INFORMATION' value='1' />
                    <Tab label='ADD MENU' value='4' />
                  </TabList>
                </Box>
                <TabPanel value='3'>{<UserDetailsScreen />}</TabPanel>
                <TabPanel value='2'>
                  <StoreDetailsScreen />
                </TabPanel>
                <TabPanel value='1'>{<SeatDetails />}</TabPanel>
                <TabPanel value='4'>{<MenuScreen />}</TabPanel>
              </TabContext>
            </Box>
            <img
              src='https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg'
              alt='Profile Photo'
              className='h-10 w-10 rounded-full shadow-2xl mx-10 cursor-pointer'
              // onClick={() => navigate('/profile')}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
