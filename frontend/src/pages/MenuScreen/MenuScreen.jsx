import React, { useState } from "react";
import { CircularProgress } from "@mui/material";
import { useCurrentUserContext } from "../../contexts/CurrentUserContext";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
import { icreateMenu } from "../../../services/qServices";
import { IoIosAddCircle } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";

const MenuScreen = ({ type }) => {
  const [userInputCount, setUserInputCount] = useState(1);
  const [itemInputCounts, setItemInputCounts] = useState([0]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(true);
  const { currentUser } = useCurrentUserContext();

  const handleAddItemMenu = (userIndex) => {
    const updatedItemInputCounts = [...itemInputCounts];
    updatedItemInputCounts[userIndex] =
      (updatedItemInputCounts[userIndex] || 0) + 1;
    setItemInputCounts(updatedItemInputCounts);
  };

  const handleCancelItem = (userIndex) => {
    const updatedItemInputCounts = [...itemInputCounts];
    updatedItemInputCounts[userIndex] = Math.max(
      0,
      (updatedItemInputCounts[userIndex] || 0) - 1
    );
    setItemInputCounts(updatedItemInputCounts);
  };

  const handleAddMore = () => {
    setUserInputCount((prevCount) => prevCount + 1);
    setItemInputCounts([...itemInputCounts, 0]);
  };

  const handleCancel = () => {
    setUserInputCount(1);
    setItemInputCounts([0]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const newData = [];
    for (let i = 0; i < userInputCount; i++) {
      const userName = document.getElementById(`user-name-${i}`).value.trim();
      const items = [];
      for (let j = 0; j < itemInputCounts[i]; j++) {
        const itemName = document
          .getElementById(`item-name-${i}-${j}`)
          .value.trim();
        const itemPrice = parseFloat(
          document.getElementById(`item-price-${i}-${j}`).value.trim()
        );
        if (itemName !== "" && !isNaN(itemPrice)) {
          items.push({ name: itemName, price: itemPrice });
        }
      }
      if (userName !== "" && items.length > 0) {
        newData.push({ name: userName, items: items });
      }
    }

    const dataToPost = {
      timezone: currentUser?.userinfo?.timezone,
      store_type: type,
      menu_data: newData,
    };

    try {
      const response = await icreateMenu(
        currentUser?.userinfo?.client_admin_id,
        getSavedNewUserDetails()[0]._id,
        type === "ONLINE"
          ? getSavedNewUserDetails()[0]?.store_ids?.online_store_id
          : getSavedNewUserDetails()[0]?.store_ids?.offline_store_id,
        dataToPost
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-200 rounded p-4">
      <div className="flex flex-col space-y-4 justify-start">
        <div className="flex items-center justify-center px-2 py-1 rounded">
          <span className="text-xl text-gray-700">Add Menu</span>
        </div>

        {[...Array(userInputCount)].map((_, userIndex) => (
          <div key={userIndex}>
            <div className="flex mt-2 items-center justify-center space-x-4">
              <input
                type="text"
                id={`user-name-${userIndex}`}
                placeholder="Enter your name"
                className="ring-1 ring-gray-300 w-full rounded-md px-4 py-1 outline-none focus:ring-2 focus:ring-teal-300"
              />

              <button>
                <IoIosAddCircle
                  className="inline text-4xl text-green-600"
                  onClick={() => handleAddItemMenu(userIndex)}
                />
              </button>
            </div>
            {[...Array(itemInputCounts[userIndex] || 0)].map((_, itemIndex) => (
              <div
                key={itemIndex}
                className="flex mt-2 items-center justify-center space-x-4"
              >
                <input
                  type="text"
                  id={`item-name-${userIndex}-${itemIndex}`}
                  placeholder="Enter menu name"
                  className="ring-1 ring-gray-300 w-full rounded-md px-4 py-1 outline-none focus:ring-2 focus:ring-teal-300"
                />
                <input
                  type="number"
                  id={`item-price-${userIndex}-${itemIndex}`}
                  placeholder="Enter price"
                  className="ring-1 ring-gray-300 w-full rounded-md px-4 py-1 outline-none focus:ring-2 focus:ring-teal-300"
                />
                <button>
                  <IoIosAddCircle
                    className="inline text-4xl text-green-600"
                    onClick={() => handleAddItemMenu(userIndex)}
                  />
                </button>
                <button>
                  <IoCloseCircle
                    className="inline text-4xl text-red-400"
                    onClick={() => handleCancelItem(userIndex)}
                  />
                </button>
                {itemIndex === itemInputCounts[userIndex] - 1 && (
                  <div className="flex items-center justify-center">
                    <button
                      className="bg-green-400 py-1 px-4 rounded-lg text-sm text-gray-500 shadow cursor-pointer"
                      onClick={() => setDone(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="md:space-x-4 space-y-2 md:space-y-0 flex flex-col md:flex-row items-start justify-start">
          <button
            className="bg-green-400 py-1 px-3 rounded-lg text-sm text-gray-500 shadow cursor-pointer"
            onClick={handleAddMore}
            hidden={done}
          >
            <IoIosAddCircle className="inline text-xl text-green-600 " /> Add
            more
          </button>
          <button
            className="bg-red-400 py-1 px-4 rounded-lg text-sm text-gray-500 shadow cursor-pointer"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="bg-green-400 py-1 px-4 rounded-lg text-sm text-gray-500 shadow cursor-pointer"
            onClick={handleSubmit}
            disabled={done}
          >
            {loading ? (
              <CircularProgress size={14} className="mx-4" />
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;
