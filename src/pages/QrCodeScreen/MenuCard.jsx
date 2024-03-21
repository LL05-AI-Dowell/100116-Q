import React from "react";

const MenuCard = ({ menus }) => {
  return (
    <div className='gap-2 grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 '>
      {menus?.map((menu, index) => (
        <div key={index} className='bg-gray-200 rounded-md shadow-md  p-4 mb-4'>
          <h3 className=' font-semibold mb-2'>{menu?.name}</h3>
          <ul>
            {menu?.items.map((item, itemIndex) => (
              <li className='mb-1 text-sm pl-3' key={itemIndex}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MenuCard;
