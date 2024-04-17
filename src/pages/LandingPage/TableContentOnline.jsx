import TableCell from '@mui/material/TableCell';
import { useQuery } from "react-query";
import {
    CircularProgress,
} from "@mui/material";
import {
    getPaymentDetailForSeat,
    // getPaymentDetailsForOnlineStoreSeats,
    getOnlineOrderBySeatNumber,
} from '../../../services/qServices';
import { getSavedNewUserDetails } from '../../hooks/useDowellLogin';
import { useCurrentUserContext } from '../../contexts/CurrentUserContext';
import { formatDateForAPI } from '../../helpers/helpers';

const SeatRowOnline = ({ seatNumber, pagination }) => {
    const { currentUser } = useCurrentUserContext();
    const currentDate = new Date();

    const dataToPost = {
        "timezone": currentUser?.userinfo?.timezone
    }

    const { isLoading, data, isError } = useQuery(
        ["seatData", seatNumber],
        async () => {
            const paymentData = await getPaymentDetailForSeat(
                currentUser?.userinfo?.client_admin_id,
                seatNumber + pagination + 1,
                formatDateForAPI(currentDate),
                getSavedNewUserDetails()[0]?.store_ids?.offline_store_id,
            );
            return paymentData;
        },
        {
            refetchInterval: 15000, // Refresh every 15 seconds
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
                <TableCell component="th" scope="row" align="center" sx={{ padding: '5px' }}>
                    {seatNumber + pagination + 1}
                </TableCell>
                <TableCell align="center" sx={{ padding: '5px' }}>loading...</TableCell>
                <TableCell align="left" sx={{ padding: '5px' }}>loading...</TableCell>
            </>
        );
    if (isError)
        // console.log(`Error fetching data seat number ${seatNumber + pagination + 1}`, !isError, data?.data?.response[0]);
        return (
            <>
                <TableCell component="th" scope="row" align="center" sx={{ padding: '5px' }}>
                    {seatNumber + pagination + 1}
                </TableCell>
                <TableCell align='center' sx={{ padding: '5px' }}>No Customer for today...</TableCell>
                <TableCell align='left' sx={{ padding: '5px' }}>No Customer for today...</TableCell>
            </>
        );


    // const isPaid = data[0].is_paid;
    {console.log('dattttttttaaaaaaaaaaaaaaaa',data)}
    const responseArray = data?.data?.response;
    const copiedArray = [...responseArray];
    const reversedArray = copiedArray.reverse();
    const amount = reversedArray[0]?.amount;
    return (
        <>
            <TableCell component="th" scope="row" align="center" sx={{ padding: '5px' }}>
                {seatNumber + pagination + 1}
            </TableCell >
            {data?.data?.response?.length === 0 ?
                <>
                    <TableCell align='center' sx={{ padding: '5px' }}>No Record Found</TableCell>
                    <TableCell align='left' sx={{ padding: '5px' }}>No Record Found</TableCell>
                </> :
                <>
                    <TableCell align='center' sx={{ padding: '5px' }}>{amount}</TableCell>
                    <TableCell align='left' sx={{ display: "flex", padding: '5px' }}>
                        {reversedArray.slice(0, 5).map((item, index) => {
                            const isPaid = item.is_paid;
                            const paymentStatus = item.payment_status;
                            return (
                                <div
                                    key={index}
                                    style={{
                                        width: "30px",
                                        height: "30px",
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

export default SeatRowOnline;