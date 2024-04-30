import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import SeatOnline from "./SeatOnline";
import SeatOffline from "./SeatOffline";
import SeatMaster from "./SeatMaster";
import MasterQrCode from "./MasterQrCode";

const SeatTab = () => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className='w-full flex items-start justify-center'>
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
            <TabList onChange={handleChange} aria-label='lab API tabs example'>
              <Tab label='MASTER QR CODE' value='1' />
              <Tab label='OFFLINE' value='2' />
              <Tab label='ONLINE' value='3' />
            </TabList>
          </Box>
          <TabPanel value='3'>
            <SeatOnline />
          </TabPanel>
          <TabPanel value='2'>{<SeatOffline />}</TabPanel>
          <TabPanel value='1'>{<MasterQrCode />}</TabPanel>
        </TabContext>
      </Box>
    </div>
  );
};

export default SeatTab;
