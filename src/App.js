import "./App.css";
import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  AppBar,
  Autocomplete,
  Button,
  TextField,
  Toolbar,
  Snackbar,
  IconButton,
  FormControl,
  FormControlLabel,
  FormGroup,
  Alert,
  Checkbox,
  InputAdornment,
  DialogActions,
} from "@mui/material";
// import { DataGridPro, GridToolbar } from "@mui/x-data-grid-pro";
import { Info, AccountCircle, Remove, Add } from "@mui/icons-material";
import { LicenseInfo } from "@mui/x-license";
import local_email from "./email.json";
import local_studies from "./studies_info.json";
import local_user_list from "./folder_access_request.json";

const App = () => {
  LicenseInfo.setLicenseKey(
    "6b1cacb920025860cc06bcaf75ee7a66Tz05NDY2MixFPTE3NTMyNTMxMDQwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );
  const title = "Subscribe for email notifications",
    // innerHeight = window.innerHeight,
    urlPrefix = window.location.protocol + "//" + window.location.host,
    { href } = window.location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    // server = href.split("//")[1].split("/")[0],
    webDavPrefix = urlPrefix + "/lsaf/webdav/repo",
    // fileViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/apps/fileviewer/index.html?file=`,
    usersUrl =
      webDavPrefix +
      "/general/biostat/metadata/projects/folder_access_request.json",
    emailUrl = webDavPrefix + "/general/biostat/apps/subscribe/email.json",
    studiesUrl =
      webDavPrefix + "/general/biostat/metadata/projects/studies_info.json",
    [openInfo, setOpenInfo] = useState(false),
    // [rows, setRows] = useState(null),
    // [cols, setCols] = useState(null),
    // [checked, setChecked] = React.useState([]),
    [compounds, setCompounds] = useState(null),
    [indications, setIndications] = useState(null),
    [studies, setStudies] = useState(null),
    [selectedCompounds, setSelectedCompounds] = useState([]),
    [selectedIndications, setSelectedIndications] = useState([]),
    [selectedStudies, setSelectedStudies] = useState([]),
    [subscriptions, setSubscriptions] = useState([]),
    [showSaveButton, setShowSaveButton] = useState(false),
    [userList, setUserList] = useState(null),
    [openUserLogin, setOpenUserLogin] = useState(false),
    [tempUsername, setTempUsername] = useState(""),
    [openSnackbar, setOpenSnackbar] = useState(false),
    [reprocess, setReprocess] = useState(false),
    [blockedStudies, setBlockedStudies] = useState(false),
    handleBlockedStudies = (event) => {
      setBlockedStudies(event.target.checked);
    },
    [gsdtmChecked, setGsdtmChecked] = useState(false),
    handleGsdtmChecked = (event) => {
      setGsdtmChecked(event.target.checked);
    },
    [newStudies, setNewStudies] = useState(false),
    handleNewStudies = (event) => {
      setNewStudies(event.target.checked);
    },
    [contractRenewal1, setContractRenewal1] = useState(false),
    handleChangeCR1 = (event) => {
      setContractRenewal1(event.target.checked);
    },
    [contractRenewal7, setContractRenewal7] = useState(false),
    handleChangeCR7 = (event) => {
      setContractRenewal7(event.target.checked);
    },
    [contractRenewal30, setContractRenewal30] = useState(false),
    handleChangeCR30 = (event) => {
      setContractRenewal30(event.target.checked);
    },
    [contractRenewal60, setContractRenewal60] = useState(false),
    handleChangeCR60 = (event) => {
      setContractRenewal60(event.target.checked);
    },
    [userFullName, setUserFullName] = useState(
      localStorage.getItem("userFullName")
    ),
    [fontSize, setFontSize] = useState(
      Number(localStorage.getItem("fontSize")) || 10
    ),
    [username, setUsername] = useState(localStorage.getItem("username")),
    handleCloseSnackbar = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setOpenSnackbar(false);
    },
    saveUser = () => {
      localStorage.setItem("username", tempUsername);
      localStorage.setItem("userFullName", userFullName);
      setUsername(tempUsername);
      setReprocess((prev) => !prev);
      setOpenUserLogin(false);
    },
    save = () => {
      const mySubscriptions = [];
      selectedCompounds.forEach((row) => {
        mySubscriptions.push({
          type: "compound",
          value: row.value,
          user: username,
        });
      });
      selectedIndications.forEach((row) => {
        mySubscriptions.push({
          type: "indication",
          value: row.value,
          user: username,
        });
      });
      selectedStudies.forEach((row) => {
        mySubscriptions.push({
          type: "study",
          value: row.value,
          user: username,
        });
      });
      mySubscriptions.push({
        type: "contractRenewal1",
        value: contractRenewal1 ? "true" : "false",
        user: username,
      });
      mySubscriptions.push({
        type: "contractRenewal7",
        value: contractRenewal7 ? "true" : "false",
        user: username,
      });
      mySubscriptions.push({
        type: "contractRenewal30",
        value: contractRenewal30 ? "true" : "false",
        user: username,
      });
      mySubscriptions.push({
        type: "contractRenewal60",
        value: contractRenewal60 ? "true" : "false",
        user: username,
      });
      mySubscriptions.push({
        type: "new",
        value: newStudies ? "true" : "false",
        user: username,
      });
      mySubscriptions.push({
        type: "blocked",
        value: blockedStudies ? "true" : "false",
        user: username,
      });
      mySubscriptions.push({
        type: "gsdtm",
        value: gsdtmChecked ? "true" : "false",
        user: username,
      });
      const updatedSubscriptions = subscriptions.filter(
        (r) => r.user !== username
      );
      updatedSubscriptions.push(...mySubscriptions);
      console.log(
        "updatedSubscriptions",
        updatedSubscriptions,
        "mySubscriptions",
        mySubscriptions
      );
      updateJsonFile(emailUrl, updatedSubscriptions);
    },
    processEmail = (email) => {
      setSubscriptions(email);
      const myRows = email.filter((row) => row.user === username),
        myCompounds = myRows.filter((row) => row.type === "compound"),
        myIndications = myRows.filter((row) => row.type === "indication"),
        myStudies = myRows.filter((row) => row.type === "study"),
        myC1 = myRows.filter((row) => row.type === "contractRenewal1"),
        myC7 = myRows.filter((row) => row.type === "contractRenewal7"),
        myC30 = myRows.filter((row) => row.type === "contractRenewal30"),
        myC60 = myRows.filter((row) => row.type === "contractRenewal60"),
        myNew = myRows.filter((row) => row.type === "new"),
        myBlocked = myRows.filter((row) => row.type === "blocked"),
        myGsdtm = myRows.filter((row) => row.type === "gsdtm");
      setSelectedCompounds(
        myCompounds.map((row) => {
          return { label: row.value, value: row.value };
        })
      );
      setSelectedIndications(
        myIndications.map((row) => {
          return { label: row.value, value: row.value };
        })
      );
      setSelectedStudies(
        myStudies.map((row) => {
          return { label: row.value, value: row.value };
        })
      );
      setContractRenewal1(!!(myC1.length > 0 && myC1[0].value === "true"));
      setContractRenewal7(!!(myC7.length > 0 && myC7[0].value === "true"));
      setContractRenewal30(!!(myC30.length > 0 && myC30[0].value === "true"));
      setContractRenewal60(!!(myC60.length > 0 && myC60[0].value === "true"));
      setNewStudies(!!(myNew.length > 0 && myNew[0].value === "true"));
      setBlockedStudies(
        !!(myBlocked.length > 0 && myBlocked[0].value === "true")
      );
      setGsdtmChecked(!!(myGsdtm.length > 0 && myGsdtm[0].value === "true"));
      console.log(
        "myC30",
        myC30,
        "myC60",
        myC60,
        "myNew",
        myNew,
        "myBlocked",
        myBlocked,
        "myGsdtm",
        myGsdtm
      );
    },
    processStudies = (studies) => {
      const uniqueCompounds = Array.from(
        new Set(
          studies.data.map((row) => {
            return row.product;
          })
        )
      ).sort((a, b) => a.localeCompare(b));
      setCompounds(
        uniqueCompounds.map((value) => ({ label: value, value: value }))
      );
      const uniqueIndications = Array.from(
          new Set(studies.data.map((row) => row.indication))
        ).sort((a, b) => a.localeCompare(b)),
        mapIndications = uniqueIndications.map((value) => ({
          label: value,
          value: value,
        }));
      setIndications(mapIndications);
      console.log("uniqueIndications", uniqueIndications);
      const uniqueStudies = Array.from(
        new Set(studies.data.map((row) => row.study))
      ).sort((a, b) => a.localeCompare(b));
      setStudies(
        uniqueStudies.map((value) => ({ label: value, value: value }))
      );
    },
    [message, setMessage] = useState(null),
    updateJsonFile = (file, content) => {
      console.log("updateJsonFile - file:", file, "content:", content);
      if (!file || !content) return;
      let tempContent;
      // handle inserting table into the right place in keyed object
      tempContent = JSON.stringify(content);
      // try to delete the file, in case it is there already, otherwise the PUT will not work
      fetch(file, {
        method: "DELETE",
      })
        .then((response) => {
          fetch(file, {
            method: "PUT",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: tempContent,
          })
            .then((response) => {
              setMessage(response.ok ? "File saved" : "File not saved");
              setOpenSnackbar(true);
              response.text().then((text) => {
                console.log("text", text);
              });
            })
            .catch((err) => {
              setMessage(err);
              setOpenSnackbar(true);
              console.log("PUT err: ", err);
            });
        })
        .catch((err) => {
          setMessage(
            "DELETE was attempted before the new version was saved - but the DELETE failed. (see console)"
          );
          setOpenSnackbar(true);
          console.log("DELETE err: ", err);
        });
    };

  useEffect(() => {
    // console.log("window", window);
    if (userList === null) return;
    const matchingUsers = userList.filter(
      (r) =>
        r.userid === tempUsername &&
        ["prg", "prg+ba", "dm", "dm+ba"].includes(r.profile)
    );
    if (matchingUsers.length > 0) {
      setShowSaveButton(true);
      setUserFullName(matchingUsers[0].Name);
    } else {
      setShowSaveButton(false);
      setUserFullName("");
    }
    // eslint-disable-next-line
  }, [tempUsername]);

  useEffect(() => {
    if (mode === "local") {
      setUserList(local_user_list);
      processEmail(local_email);
      processStudies(local_studies);
    } else {
      fetch(usersUrl) // folder_access_request.json
        .then((response) => response.json())
        .then((data) => {
          setUserList(data);
        });
      fetch(emailUrl) //email.json
        .then((response) => response.json())
        .then((data) => {
          processEmail(data);
        });
      fetch(studiesUrl) // studies_info.json
        .then((response) => response.json())
        .then((data) => {
          processStudies(data);
        });
    }
    // eslint-disable-next-line
  }, [mode, reprocess]);

  useEffect(() => {
    if (username === null) {
      setTempUsername("");
      setOpenUserLogin(true);
    } else {
      setTempUsername(username);
      setOpenUserLogin(false);
      setOpenSnackbar(true);
    }
  }, [username]);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar
          variant="dense"
          sx={{ fontSize: { fontSize }, backgroundColor: "#cccccc" }}
        >
          <Box
            sx={{
              backgroundColor: "#eeeeee",
              color: "green",
              fontWeight: "bold",
              boxShadow: 3,
              fontSize: { fontSize },
              mr: 3,
            }}
          >
            &nbsp;&nbsp;{title}&nbsp;&nbsp;
          </Box>
          {/* <Tooltip title="Notify me about all blackouts">
            <IconButton
              sx={{ color: "blue" }}
              size="small"
              onClick={() => {
                setFontSize(fontSize - 3);
                localStorage.setItem("fontSize", fontSize - 3);
              }}
            >
              <Contrast />
            </IconButton>
          </Tooltip> */}
          {/* <Tooltip title="Notify me about all new studies">
            <IconButton
              sx={{ color: "blue" }}
              size="small"
              onClick={() => {
                setFontSize(fontSize - 3);
                localStorage.setItem("fontSize", fontSize - 3);
              }}
            >
              <FiberNew />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="Smaller font">
            <IconButton
              sx={{ color: "black", fontWeight: "bold" }}
              size="small"
              onClick={() => {
                setFontSize(fontSize - 3);
                localStorage.setItem("fontSize", fontSize - 3);
              }}
            >
              <Remove />
            </IconButton>
          </Tooltip>
          <Box sx={{ fontSize: { fontSize }, color: "black" }}>
            &nbsp;{fontSize}&nbsp;
          </Box>
          <Tooltip title="Larger font">
            <IconButton
              sx={{ color: "black", fontWeight: "bold", mr: 3 }}
              size="small"
              onClick={() => {
                setFontSize(fontSize + 3);
                localStorage.setItem("fontSize", fontSize + 3);
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
          <Box
            sx={{ color: "black", fontWeight: "bold", ml: 3 }}
          >{`${userFullName} (${username})`}</Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Information about this screen">
            <IconButton
              color="info"
              // sx={{ mr: 2 }}
              onClick={() => {
                setOpenInfo(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 7, ml: 3, fontSize: fontSize - 3 }}>
        Choosing a compound includes all indications and studies related to that
        compound. Choosing an indication includes all compounds and studies
        related to that indication.
      </Box>
      <hr />
      {compounds && (
        <Autocomplete
          options={compounds}
          value={selectedCompounds}
          onChange={(event, newValue) => {
            setSelectedCompounds(newValue);
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          multiple
          sx={{ mt: 2, ml: 3 }}
          id="tags-compound"
          disableCloseOnSelect
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Compounds"
              placeholder="Select"
              // InputProps={{ style: { fontSize: { fontSize } } }}
            />
          )}
        />
      )}
      {indications && (
        <Autocomplete
          options={indications}
          value={selectedIndications}
          onChange={(event, newValue) => {
            setSelectedIndications(newValue);
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          multiple
          sx={{ mt: 2, ml: 3 }}
          id="tags-indication"
          defaultValue={[]}
          disableCloseOnSelect
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Indications"
              placeholder="Select"
            />
          )}
        />
      )}
      {studies && (
        <Autocomplete
          options={studies}
          value={selectedStudies}
          onChange={(event, newValue) => {
            setSelectedStudies(newValue);
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          multiple
          sx={{ mt: 2, ml: 3 }}
          id="tags-study"
          defaultValue={[]}
          disableCloseOnSelect
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Studies"
              placeholder="Select"
            />
          )}
        />
      )}
      <br />
      <FormControl component="fieldset" variant="standard" size="small">
        <FormGroup row>
          <Box sx={{ fontWeight: "bold", mt: 1, mr: 1, color: "gray" }}>
            Select things you want notifications about:
          </Box>
          <Tooltip title="Notify me about all new studies">
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ color: "green" }}
                  checked={newStudies}
                  onChange={handleNewStudies}
                />
              }
              sx={{ color: "green" }}
              label="New studies"
            />
          </Tooltip>
          <Tooltip title="Notify me about all blocked out studies">
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ color: "red" }}
                  checked={blockedStudies}
                  onChange={handleBlockedStudies}
                />
              }
              sx={{ color: "red" }}
              label="Blocked studies"
            />
          </Tooltip>
          <Tooltip title="Include notifications about gSDTM studies (usually only Data Managers need this)">
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ color: "blue" }}
                  checked={gsdtmChecked}
                  onChange={handleGsdtmChecked}
                />
              }
              sx={{ color: "blue" }}
              label="gSDTM notifications"
            />
          </Tooltip>
        </FormGroup>
      </FormControl>
      <br />
      <FormControl component="fieldset" variant="standard" size="small">
        <FormGroup row>
          <Box sx={{ fontWeight: "lighter", mt: 1, mr: 1, color: "gray" }}>
            Contract renewal notifications (for managers):
          </Box>
          <Tooltip title="Notify me when there is only 1 day till contract renewal">
            <FormControlLabel
              control={
                <Checkbox
                  checked={contractRenewal1}
                  onChange={handleChangeCR1}
                  label="1 day"
                />
              }
              sx={{ color: "red", fontWeight: "lighter" }}
              label="1 day"
            />
          </Tooltip>
          <Tooltip title="Notify me when there is only 1 week till contract renewal">
            <FormControlLabel
              control={
                <Checkbox
                  checked={contractRenewal7}
                  onChange={handleChangeCR7}
                  label="7 days"
                />
              }
              sx={{ color: "orange", fontWeight: "lighter" }}
              label="7 days"
            />
          </Tooltip>
          <Tooltip title="Notify me when there are 30 days till contract renewal">
            <FormControlLabel
              control={
                <Checkbox
                  checked={contractRenewal30}
                  onChange={handleChangeCR30}
                  label="30 days"
                />
              }
              sx={{ color: "blue", fontWeight: "lighter" }}
              label="30 days"
            />
          </Tooltip>
          <Tooltip title="Notify me when there are 60 days till contract renewal">
            <FormControlLabel
              control={
                <Checkbox
                  checked={contractRenewal60}
                  onChange={handleChangeCR60}
                  label="60 days"
                />
              }
              sx={{ color: "green", fontWeight: "lighter" }}
              label="60 days"
            />
          </Tooltip>
        </FormGroup>
      </FormControl>
      <br />
      <Button
        sx={{
          border: 1,
          ml: 3,
          mt: 2,
          bgcolor: "green",
          color: "white",
          fontSize: { fontSize },
        }}
        size="small"
        variant="contained"
        onClick={() => {
          save();
        }}
      >
        Save
      </Button>
      {/* dialog that prompts for a user name */}
      {!username && (
        <Dialog
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenUserLogin(false)}
          open={openUserLogin}
          title={"User Login"}
        >
          <DialogTitle>
            <Box>
              {" "}
              {userFullName && userFullName.length > 0
                ? `Hi ${userFullName}! Now you are recognized you can press SAVE.`
                : "Who are you?"}
            </Box>
          </DialogTitle>
          <DialogContent>
            {" "}
            <TextField
              id="input-with-icon-textfield"
              label="User Name"
              placeholder="e.g. pmason"
              value={tempUsername}
              onChange={(e) => {
                setTempUsername(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            {tempUsername &&
              userList &&
              tempUsername > "" &&
              userList.length > 0 && (
                <Button
                  sx={{ height: fontSize + 3, border: 1 }}
                  disabled={!showSaveButton}
                  onClick={() => saveUser()}
                >
                  Save
                </Button>
              )}
          </DialogActions>
        </Dialog>
      )}
      {/* <Box sx={{ width: "100%" }}>
            {rows && (
              <DataGridPro
                autoHeight={true}
                rows={rows}
                columns={cols}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                // sx={{ "& .MuiDataGrid-row": { fontSize: fontSize } }}
              />
            )}{" "}
          </Box> */}
      {/* Dialog with General info about this screen */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <DialogTitle>Info about this screen</DialogTitle>
        <DialogContent>
          <Box sx={{ color: "blue", fontSize: 11 }}>
            Select what you want to be notified about. Selecting a compound or
            indications will notify you about all studies related to what you
            select.
            <p />A job runs every 2 hours each day between 7:15am and 9:15pm and
            will then email you if there are any changes. The job that checks
            for zips is located here:
            <b>/general/biostat/jobs/utils/dev/jobs/news.job</b>
            <p /> You can also look at the JSON file where this data is stored{" "}
            <a
              href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/apps/view/index.html?lsaf=/general/biostat/apps/subscribe/email.json&meta=/general/biostat/apps/subscribe/email_metadata.json"
              target="_blank"
              rel="noreferrer"
            >
              here ⛳
            </a>
            <p />
            We check for the following things:{" "}
            <ul>
              <li>New studies</li>
              <li>Blocked studies</li>
              <li>Changes in study status</li>
              <li>
                New zip files, but by default you don't get emails for new zips
                in gSDTM studies
              </li>
            </ul>{" "}
          </Box>
        </DialogContent>
      </Dialog>

      {!message && tempUsername && (
        <Snackbar
          severity="success"
          open={openSnackbar}
          autoHideDuration={7000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            Welcome 👨‍🦲 {userFullName} ({username})
          </Alert>
        </Snackbar>
      )}
      {message && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={message}
        />
      )}
    </>
  );
};
export default App;
