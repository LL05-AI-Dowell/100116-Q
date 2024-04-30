import { useState, useEffect } from "react";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import {
  getMenuData,
  getOfflineOnlineMenuData,
} from "../../../services/qServices";
import MenuCard from "../QrCodeScreen/MenuCard";
import { CircularProgress } from "@mui/material";

const ViewMenu = ({ type }) => {
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getOfflineOnlineMenuData(
      getSavedNewUserDetails()[0].workspace_id,
      type === 'ONLINE' ? getSavedNewUserDetails()[0]?.store_ids?.online_store_id : getSavedNewUserDetails()[0]?.store_ids?.offline_store_id,
      type
    )
      .then((res) => {
        console.log("get Menu data ress", res?.data?.response);
        setMenuData(res?.data?.response);
        setLoading(false);
      })
      .catch((err) => {
        console.log("get store data errrrrr", err);
        setLoading(false);
      });
  }, [type]);

  return (
    <div className='w-full bg-gray-100 rounded p-4 overflow-hidden'>
      <h3 className='text-xl font-semibold mb-4 text-center'>Menu Items</h3>
      <div className='h-80 overflow-auto'>
        {loading ? (
          <div className='flex items-center justify-center p-12 '>
            <CircularProgress size={28} className='mx-4' />
          </div>
        ) : (
          <div className='w-full  p-1  items-center justify-start '>
            {menuData?.map((menu) => (
              <MenuCard key={menu?._id} menus={menu?.menu_data} />
            ))}
          </div>
        )}{" "}
      </div>
    </div>
  );
};

export default ViewMenu;
