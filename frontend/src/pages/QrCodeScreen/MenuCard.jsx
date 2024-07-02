import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const MenuCard = ({ menus }) => {
  console.log("tt 1 -> ", menus);
  return <></>;

  if (!Array.isArray(menus)) return <></>;

  return (
    <Grid container spacing={3}>
      {React.Children.toArray(
        menus?.map((menu) => (
          <Grid item xs={12} sm={6} md={4}>
            <Card className="menu-card">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {menu?.name}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ fontWeight: "bold" }}>
                          Item
                        </TableCell>
                        <TableCell align="right" style={{ fontWeight: "bold" }}>
                          Price
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!Array.isArray(menu?.items) ? (
                        <></>
                      ) : (
                        React.Children.toArray(
                          menu?.items?.map((item) => {
                            if (!item?.name || !item?.price) return <></>;

                            return (
                              <TableRow>
                                <TableCell component="th" scope="row">
                                  {item?.name}
                                </TableCell>
                                <TableCell align="right">
                                  {item?.price}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default MenuCard;
