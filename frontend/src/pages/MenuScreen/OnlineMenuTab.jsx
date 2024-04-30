import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import MenuScreen from "./MenuScreen";
import ViewMenu from "./ViewMenu";

const OnlineMenuTab = () => {
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
              <Tab label='ADD MENU' value='1' />
              <Tab label='VIEW MENU' value='2' />
            </TabList>
          </Box>
          <TabPanel value='1'>
            <MenuScreen type={"ONLINE"} />
          </TabPanel>
          <TabPanel value='2'>
            <ViewMenu type={"ONLINE"} />
          </TabPanel>
        </TabContext>
      </Box>
    </div>
  );
};

export default OnlineMenuTab;
