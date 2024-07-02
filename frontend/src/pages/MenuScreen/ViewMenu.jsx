import React, { useState, useEffect } from "react";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import { getOfflineOnlineMenuData } from "../../../services/qServices";
import MenuCard from "../QrCodeScreen/MenuCard";
import { CircularProgress, Alert } from "@mui/material";

const ViewMenu = ({ type }) => {
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const userDetails = getSavedNewUserDetails()[0];
    const storeId =
      type === "ONLINE"
        ? userDetails?.store_ids?.online_store_id
        : userDetails?.store_ids?.offline_store_id;

    getOfflineOnlineMenuData(userDetails.workspace_id, storeId, type)
      .then((res) => {
        if (res.data.success) {
          setMenuData(res.data.response);
        } else {
          setError("Failed to retrieve menu data");
        }
      })
      .catch((err) => {
        setError("Error fetching menu data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [type]);

  return (
    <div className="w-full bg-gray-100 rounded p-4 overflow-hidden">
      <h3 className="text-xl font-semibold mb-4 text-center">Menu Items</h3>
      <div className="h-80 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <CircularProgress size={28} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <Alert severity="error">{error}</Alert>
          </div>
        ) : (
          <div className="w-full p-1">
            {menuData.map((menu, index) => (
              <MenuCard key={index} menus={menu.menu_data} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMenu;
