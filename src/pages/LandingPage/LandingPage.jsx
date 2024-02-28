import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import { useCurrentUserContext } from '../../contexts/CurrentUserContext';
import StepModal from '../Modal/Modal';
import { getApiKeyInfoFromClientAdmin } from '../../../services/loginServices';

const LandingPage = () => {
    const { currentUser } = useCurrentUserContext();
    const [cardPagination, setCardPagination] = useState(0);
    const [cardIndex, setCardIndex] = useState(0);
    const navigate = useNavigate();

    function createData(name, calories, fat, carbs, protein) {
        return { name, calories, fat, carbs, protein };
    }

    const rows = [
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),
        createData(1, 159, 6.0, 24, 4.0),
        createData(2, 237, 9.0, 37, 4.3),
        createData(3, 262, 16.0, 24, 6.0),
        createData(4, 305, 3.7, 67, 4.3),
        createData(5, 356, 16.0, 49, 3.9),

    ];

    const incrementStepPagination = async (steps, length) => {
        console.log(currentUser);
        if (steps + 1 <= 100) {
            if (steps + cardPagination !== 100) {
                setCardPagination(cardPagination + 5);
            }
        }
        await getApiKeyInfoFromClientAdmin(currentUser?.userinfo?.client_admin_id).then(res => {
            console.log('resssss', res);
        })
    };

    const decrementStepPagination = () => {
        if (cardPagination == 5) {
            setCardPagination(0);
        } else if (cardPagination > 5) {
            setCardPagination(cardPagination - 5);
        }
    };

    const handleInputChange = (event) => {
        let value = parseInt(event.target.value, 10);

        if (value > 99) {
            value = 99;
        } else if (value <= 0) {
            value = 1;
        } else {
            const newValue = event.key === 'ArrowUp' ? value + 1 : event.key === 'ArrowDown' ? Math.max(0, value - 1) : value;
            event.target.value = newValue;
        }

        event.target.value = value;
    };

    const handleAmountInputChange = (event) => {
        const currentValue = parseInt(event.target.value || '0', 10);

        if (event.nativeEvent.inputType === 'insertText') {
            const newValue = currentValue < 0 ? 0 : currentValue;
            event.target.value = newValue;
        } else if (currentValue <= 0) {
            event.target.value = 0;
        } else {
            const newValue = event.key === 'ArrowUp' ? currentValue + 1 : event.key === 'ArrowDown' ? Math.max(0, currentValue - 1) : currentValue;
            event.target.value = newValue;
        }

    }

    // useEffect(() => {

    // }, [])


    return (
        <>
            <div className="h-screen m-0 p-0 gradient_ flex items-baseline">
                <div className="w-full h-full bg-white margin_ shadow-black mt-3.5 p-4 pt-2 pb-6 rounded-md md:w-11/12 md:h-max">
                    <div className="h-24 border-b-2 border-zinc-400 m-2 flex items-center justify-between">
                        <img
                            src="https://media.licdn.com/dms/image/C510BAQF1CjF_d3HRlQ/company-logo_200_200/0/1630588309422/dowell_true_moments_living_lab_logo?e=2147483647&v=beta&t=ogSePm-Hfzu6Ng_21HyCOYUmaIZAJEdo83AKsUnQQVY"
                            alt="Dowell Logo"
                            className="h-5/6 shadow-2xl mx-8"
                        />
                        <p className="text-5xl font-bold">Q</p>
                        <img
                            src="https://i.pinimg.com/736x/f8/66/8e/f8668e5328cfb4938903406948383cf6.jpg"
                            alt="Profile Photo"
                            className="h-10 w-10 rounded-full shadow-2xl mx-10 cursor-pointer"
                            onClick={() => navigate('/profile')}
                        />
                    </div>
                    <div className="flex h-[50%] items-center sm:h-[325px]">
                        <div className=" flex flex-col h-full w-full py-8 shadow-2xl sm:flex-row">
                            <TableContainer component={Paper} style={{ width: '98%' }}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">No.</TableCell>
                                            <TableCell align="center">Seat Number</TableCell>
                                            <TableCell align="center">Create Payment Request</TableCell>
                                            <TableCell align="left">Payment Requests</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.slice(cardPagination, cardPagination + 5).map((row, index) => (
                                            <TableRow key={index + '_'}>
                                                <TableCell component="th" scope="row" align="center">
                                                    {index + cardPagination + 1}
                                                </TableCell>
                                                {/* <TableCell align="center">{row.name}</TableCell> */}
                                                <TableCell align="center">{row.calories}</TableCell>
                                                <TableCell align="center">{row.fat}</TableCell>
                                                <TableCell align="left">{row.carbs}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <div className="w-full m-2 flex items-center justify-center sm:w-1/6 sm:m-0">
                                <div className="flex items-center rotate-0 sm:rotate-90">
                                    <button
                                        className="cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-9 h-9"
                                        onClick={() =>
                                            decrementStepPagination()
                                        }
                                    >
                                        <IoIosArrowBack />
                                    </button>
                                    {
                                        createArrayWithLength(100)
                                            .slice(
                                                cardPagination,
                                                cardPagination + 5
                                            )
                                            .map((s, index) => (
                                                <div className="rotate-0 sm:rotate-90">
                                                    <button
                                                        className="rotate-0 bg-inherit text-black border-solid border border-sky-500 rounded-full m-0.5 w-9 h-9 sm:rotate-180"
                                                        onClick={() => {
                                                            setCardIndex(index);
                                                        }}
                                                        key={`${s}_button`}
                                                    >
                                                        {s + 1}
                                                    </button>
                                                </div>
                                            ))
                                    }
                                    <button
                                        className="cursor-pointer bg-inherit text-black border-solid border-2 border-sky-500 rounded-full flex items-center justify-center bg-sky-100 w-9 h-9"
                                        onClick={() =>
                                            incrementStepPagination(5, 100 / 5)
                                        }
                                    >
                                        <IoIosArrowForward />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-20 flex items-center justify-center py-6 m-6">
                        <p className="text-sm mx-1 sm:text-lg sm:mx-4">Seat Number:</p>
                        <input
                            type='number'
                            className="cursor-pointer p-0 text-4xl bg-inherit m-0 border-solid border border-sky-500 rounded w-20 focus:outline-none sm:text-5xl sm:border-none sm:m-2 sm:p-1 sm:w-28"
                            min="1"
                            max="99"
                            onInput={handleInputChange}
                        ></input>
                        <p className="text-sm mx-1 sm:text-lg sm:mx-4">Amount:</p>
                        <input
                            type='number'
                            className="cursor-pointer p-0 bg-inherit text-4xl border-solid border border-sky-500 m-0 rounded w-20 focus:outline-none sm:text-5xl sm:w-44 sm:border-none sm:m-2 sm:p1 sm:w-28"
                            onChange={handleAmountInputChange}
                        ></input>
                        <button class="cursor-pointer flex items-center justify-center bg-white hover:bg-green-100 text-gray-800 font-semibold py-2 px-4 border border-green-400 rounded shadow m-2">Enter<IoArrowForwardCircleSharp className="mx-2 text-xl" /></button>
                    </div>
                    <div className="flex flex-col m-1 items-center justify-center m-4 sm:flex-row sm:m-6">
                        <button class="cursor-pointer bg-white hover:bg-orange-100 text-gray-800 font-semibold py-2 px-4 border border-orange-400 rounded shadow m-2">Close Seat/Service Desk</button>
                        <button class="cursor-pointer bg-white hover:bg-sky-100 text-gray-800 font-semibold py-2 px-4 border border-sky-400 rounded shadow m-2">Start Service to Selected Seat/Desk</button>
                        <button class="cursor-pointer flex items-center justify-between bg-white hover:bg-rose-100 text-gray-800 font-semibold py-2 px-4 border border-rose-600 rounded shadow m-2"><CiLogout className="mx-2 text-xl" />Logout</button>
                    </div>
                </div>
            </div >
        </>
    )
}
export default LandingPage;

export function createArrayWithLength(length) {
    return Array.from({ length }, (_, index) => index);
}