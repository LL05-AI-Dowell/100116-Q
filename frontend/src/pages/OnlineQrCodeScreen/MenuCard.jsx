import React from "react";
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const MenuCard = ({ menus }) => {
  return (
    <Grid container spacing={3}>
      {menus?.map((menu, index) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          <Card className="menu-card">
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {menu?.name}
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Price (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {menu?.items.map((item, itemIndex) => (
                      <TableRow key={itemIndex}>
                        <TableCell component="th" scope="row">
                          {item.name}
                        </TableCell>
                        <TableCell align="right">{item.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MenuCard;
