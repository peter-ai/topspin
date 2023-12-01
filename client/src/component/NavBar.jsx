import { NavLink, useLocation } from "react-router-dom";
import SportsBaseballTwoToneIcon from "@mui/icons-material/SportsBaseballTwoTone";
import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

// formatText is a helper function that wraps text in the NavBar
// where necessary
function formatText(text) {
  if (text.split(" ").length === 1) {
    return <>{text}</>;
  } else {
    return (
      <>
        {text.split(" ")[0]}
        <br />
        {text.split(" ")[1]}
      </>
    );
  }
}

// NavText is a helper function which helps the formatting
// of navigation links for the navbar
function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? "h5" : "h7"}
      noWrap
      sx={{
        fontWeight: isMain ? 700 : 600,
        letterSpacing: ".2rem",
      }}
    >
      <NavLink
        to={href}
        style={{
          color: "inherit",
          textDecoration: "none",
        }}
      >
        {formatText(text)}
      </NavLink>
    </Typography>
  );
}

// NavBar component definition.
// We use MUI Grid components to structure our NavBar and a helper function
// to assist in formatting the text.
export default function NavBar() {
  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Grid
            container
            wrap="nowrap"
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            spacing={2}
          >
            <Grid
              item
              display="flex"
              justifyContent={"flex-start"}
              alignItems="center"
              xs={3}
            >
              <SportsBaseballTwoToneIcon
                sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
                color="success"
              />
              <NavText href="/" text="TopSpin" isMain />
            </Grid>

            <Grid
              container
              item
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-end"}
              spacing={4}
            >
              <Grid item xs="auto" style={{ textAlign: "center" }}>
                <Button
                  color={
                    useLocation().pathname === "/player" ? "success" : "inherit"
                  }
                  style={{ textTransform: "none", textAlign: "center" }}
                >
                  <NavText href="/player" text="Players" />
                </Button>
              </Grid>
              <Grid item xs="auto" style={{ textAlign: "center" }}>
                <Button
                  color={
                    useLocation().pathname === "/compare"
                      ? "success"
                      : "inherit"
                  }
                  style={{ textTransform: "none", textAlign: "center" }}
                >
                  <NavText href="/compare" text="Compare Players" />
                </Button>
              </Grid>
              <Grid item xs="auto" style={{ textAlign: "center" }}>
                <Button
                  color={
                    useLocation().pathname === "/tournament"
                      ? "success"
                      : "inherit"
                  }
                  style={{ textTransform: "none", textAlign: "center" }}
                >
                  <NavText href="/tournament" text="Tournaments" />
                </Button>
              </Grid>
              <Grid item xs="auto" style={{ textAlign: "center" }}>
                <Button
                  color={
                    useLocation().pathname === "/simulate"
                      ? "success"
                      : "inherit"
                  }
                  style={{ textTransform: "none", textAlign: "center" }}
                >
                  <NavText href="/simulate" text="Tournament Simulation" />
                </Button>
              </Grid>
              <Grid item xs="auto" style={{ textAlign: "center" }}>
                <Button
                  color={
                    useLocation().pathname === "/betting"
                      ? "success"
                      : "inherit"
                  }
                  style={{ textTransform: "none", textAlign: "center" }}
                >
                  <NavText href="/betting" text="Betting Strategies" />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
