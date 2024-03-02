import TableCell from '@mui/material/TableCell';
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import {
    CircularProgress,
} from "@mui/material";
import {
    getPaymentDetailForSeat,
} from '../../../services/qServices';
import { getSavedNewUserDetails } from '../../hooks/useDowellLogin';
import { useCurrentUserContext } from '../../contexts/CurrentUserContext';
import { formatDateForAPI } from '../../helpers/helpers';

const SeatRow = ({ seatNumber, pagination }) => {
    const { currentUser } = useCurrentUserContext();
    const currentDate = new Date();

    const dataToPost = {
        "timezone": currentUser?.userinfo?.timezone
    }

    const { isLoading, data, isError } = useQuery(
        ["seatData", seatNumber],
        () => getPaymentDetailForSeat(currentUser?.userinfo?.client_admin_id, seatNumber + pagination + 1, formatDateForAPI(currentDate), getSavedNewUserDetails()[0]?.store_ids[0], dataToPost),
        {
            refetchInterval: 15000, // Refresh every 5 seconds
        }
    );

    const getColor = (isPaid, paymentStatus) => {
        if (!isPaid) {
            if (paymentStatus === "not_paid") {
                return "#FCC629";
            } else {
                return "#E74E44";
            }
        } else {
            if (paymentStatus === "paid") {
                return "#71AE38";
            } else {
                return "#";
            }
        }
    };

    if (isLoading)
        return (
            <>
                <TableCell component="th" scope="row" align="center">
                    {seatNumber + pagination + 1}
                </TableCell>
                <TableCell align="center">loading...</TableCell>
                <TableCell align="left">loading...</TableCell>
            </>
        );
    if (isError || !data)
        // console.log(`Error fetching data seat number ${seatNumber + pagination + 1}`, !isError, data?.data?.response[0]);
        return (
            <>
                <TableCell component="th" scope="row" align="center">
                    {seatNumber + pagination + 1}
                </TableCell>
                <TableCell align="center">No Customer</TableCell>
                <TableCell align="left">No Customer</TableCell>
            </>
        );


    // const isPaid = data[0].is_paid;

    const responseArray = data?.data?.response;
    const copiedArray = [...responseArray];
    const reversedArray = copiedArray.reverse();
    const amount = reversedArray[0]?.amount;
    return (
        <>
            <TableCell component="th" scope="row" align="center">
                {seatNumber + pagination + 1}
            </TableCell >
            {data?.data?.response?.length === 0 ?
                <>
                    <TableCell align="center">No Record Found</TableCell>
                    <TableCell sx={{ display: 'flex' }} align="left">No Record Found</TableCell>
                </> :
                <>
                    <TableCell align="center">{amount}</TableCell>
                    <TableCell sx={{ display: 'flex' }} align="left">
                        {reversedArray.map((item, index) => {
                            const isPaid = item.is_paid;
                            const paymentStatus = item.payment_status;
                            return (
                                <div
                                    key={index}
                                    style={{
                                        width: "25px",
                                        height: "25px",
                                        backgroundColor: getColor(isPaid, paymentStatus),
                                        borderRadius: "30%",
                                        margin: "3px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "15px",
                                    }}
                                >
                                    {index + 1}
                                </div>
                            );
                        })}
                    </TableCell>
                </>
            }
        </>
    );
};

export default SeatRow;