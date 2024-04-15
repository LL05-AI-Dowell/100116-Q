import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Badge from "@mui/joy/Badge";
import { getSavedNewUserDetails } from "../../hooks/useDowellLogin";
// import './styles.css';

const UserDetailsScreen = () => {
  const user = getSavedNewUserDetails();
  const [isEditing, setIsEditing] = useState(false);
  const [isTicketEditing, setIsTicketEditing] = useState(false);
  const [isImageUrlEditing, setIsImageUrlEditing] = useState(false);
  const [editedBankDetails, setEditedBankDetails] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ticketLink, setTicketLink] = useState("");

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveClick = () => {
    setEditedBankDetails("");
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedBankDetails("");
    setIsEditing(false);
  };

  const handleBankDetailsChange = (event) => {
    setEditedBankDetails(event.target.value);
  };

  const handleTicketEditClick = () => {
    setIsTicketEditing(!isTicketEditing);
  };

  const handleSaveTicketClick = () => {
    setTicketLink("");
    setIsTicketEditing(false);
  };

  const handleCanceTicketlClick = () => {
    setTicketLink("");
    setIsTicketEditing(false);
  };

  const handleTicketLinkChange = (event) => {
    setTicketLink(event.target.value);
  };

  const handleEditImageUrlClick = () => {
    setIsImageUrlEditing(!isImageUrlEditing);
  };

  const handleSaveImageUrlClick = () => {
    setImageUrl("");
    setIsImageUrlEditing(false);
  };

  const handleCancelImageUrlClick = () => {
    setImageUrl("");
    setIsImageUrlEditing(false);
  };

  const handleImageUrlChange = (event) => {
    setImageUrl(event.target.value);
  };

  return (
    <Card
      variant='outlined'
      className='mainCard'
      sx={{
        color: "black",
        width: "90%",
        display: "flex",
        alignItems: "center",
        borderRadius: "10px",
        border: "none",
      }}
    >
      <CardContent>
        <div className='m-8'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                variant='inherit'
                component='span'
                style={{ marginRight: "8px", whiteSpace: "nowrap" }}
              >
                <label className='text-xl font-semibold text-stone-700'>
                  Name:
                </label>
              </Typography>
              <span>{user[0]?.name}</span>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='inherit'
                className='value'
                component='span'
                style={{ marginRight: "8px", whiteSpace: "nowrap" }}
              >
                <label className='text-xl font-semibold text-stone-700'>
                  Username:
                </label>{" "}
              </Typography>
              <span>{user[0]?.username}</span>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='inherit'
                className='value'
                component='span'
                style={{ marginRight: "8px", whiteSpace: "nowrap" }}
              >
                <label className='text-xl font-semibold text-stone-700'>
                  Email:
                </label>{" "}
              </Typography>
              <span>{user[0]?.email}</span>
            </Grid>
            <Grid item xs={12}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant='inherit'
                  className='value'
                  component='span'
                  style={{ marginRight: "8px", whiteSpace: "nowrap" }}
                >
                  <label className='text-xl font-semibold text-stone-700'>
                    Bank Details :
                  </label>{" "}
                </Typography>
                {isEditing ? (
                  <TextField
                    variant='outlined'
                    value={editedBankDetails}
                    sx={{
                      width: { xs: "50%", sm: "50%", md: "30%" },
                      height: { xs: "40px", sm: "50px", md: "60px" },
                      "& .MuiOutlinedInput-root": {
                        color: "black",
                      },
                    }}
                    onChange={handleBankDetailsChange}
                    InputProps={{
                      sx: { color: "black" },
                    }}
                  />
                ) : (
                  <TextField
                    sx={{ width: "30%" }}
                    value={editedBankDetails}
                    variant='standard'
                    disabled
                  />
                )}
                {isEditing ? (
                  <>
                    <IconButton onClick={handleSaveClick}>
                      <SaveIcon style={{ color: "green" }} />
                    </IconButton>
                    <IconButton onClick={handleCancelClick}>
                      <CancelIcon style={{ color: "red" }} />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={handleEditClick}>
                    <EditIcon style={{ color: "black" }} />
                  </IconButton>
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant='inherit'
                  className='value'
                  component='span'
                  style={{ marginRight: "8px", whiteSpace: "nowrap" }}
                >
                  <label className='text-xl font-semibold text-stone-700'>
                    Ticket Link :
                  </label>{" "}
                </Typography>
                {isTicketEditing ? (
                  <TextField
                    variant='outlined'
                    value={ticketLink}
                    sx={{
                      width: { xs: "50%", sm: "50%", md: "30%" },
                      height: { xs: "40px", sm: "50px", md: "60px" },
                      "& .MuiOutlinedInput-root": {
                        color: "black",
                      },
                    }}
                    onChange={handleTicketLinkChange}
                    InputProps={{
                      sx: { color: "black" },
                    }}
                  />
                ) : (
                  <TextField
                    sx={{ width: "30%" }}
                    value={ticketLink}
                    variant='standard'
                    disabled
                  />
                )}
                {isTicketEditing ? (
                  <>
                    <IconButton onClick={handleSaveTicketClick}>
                      <SaveIcon style={{ color: "green" }} />
                    </IconButton>
                    <IconButton onClick={handleCanceTicketlClick}>
                      <CancelIcon style={{ color: "red" }} />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={handleTicketEditClick}>
                    <EditIcon style={{ color: "black" }} />
                  </IconButton>
                )}
              </div>
            </Grid>
            {/* ----------------------------------------------------------------------------- */}
            <Grid item xs={12}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant='inherit'
                  className='value'
                  component='span'
                  style={{ marginRight: "8px", whiteSpace: "nowrap" }}
                >
                  <label className='text-xl font-semibold text-stone-700'>
                    Product Name :
                  </label>{" "}
                </Typography>
                {isImageUrlEditing ? (
                  <TextField
                    variant='outlined'
                    value={imageUrl}
                    sx={{
                      width: { xs: "50%", sm: "50%", md: "30%" },
                      height: { xs: "40px", sm: "50px", md: "60px" },
                      "& .MuiOutlinedInput-root": {
                        color: "black",
                      },
                    }}
                    onChange={handleImageUrlChange}
                    InputProps={{
                      sx: { color: "black" },
                    }}
                  />
                ) : (
                  <TextField
                    sx={{ width: "30%" }}
                    value={imageUrl}
                    variant='standard'
                    disabled
                  />
                )}
                {isImageUrlEditing ? (
                  <>
                    <IconButton onClick={handleSaveImageUrlClick}>
                      <SaveIcon style={{ color: "green" }} />
                    </IconButton>
                    <IconButton onClick={handleCancelImageUrlClick}>
                      <CancelIcon style={{ color: "red" }} />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={handleEditImageUrlClick}>
                    <EditIcon style={{ color: "black" }} />
                  </IconButton>
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='inherit'
                className='value'
                component='span'
                style={{ marginRight: "3%", whiteSpace: "nowrap" }}
              >
                <label className='text-xl font-semibold text-stone-700'>
                  Paid:
                </label>{" "}
              </Typography>
              <span>
                {user[0]?.is_paid ? (
                  <Badge color='success' />
                ) : (
                  <Badge color='danger' />
                )}
              </span>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='inherit'
                className='value'
                component='span'
                style={{ marginRight: "3%", whiteSpace: "nowrap" }}
              >
                <label className='text-xl font-semibold text-stone-700'>
                  Active:
                </label>{" "}
              </Typography>
              <span>
                {user[0]?.is_active ? (
                  <Badge color='success' />
                ) : (
                  <Badge color='danger' />
                )}
              </span>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='inherit'
                className='value'
                component='span'
                style={{ marginRight: "8px", whiteSpace: "nowrap" }}
              >
                <label className='text-xl font-semibold text-stone-700'>
                  Created on:
                </label>{" "}
              </Typography>
              <span>
                {new Date(user[0]?.created_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "medium",
                })}
              </span>
            </Grid>
          </Grid>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetailsScreen;
