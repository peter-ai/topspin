import { useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function HomePage() {
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/`)
      .then((res) => res.text())
      .then((resJson) => console.log(resJson))
      .catch((err) => console.log(err));
  });

  return (
    <>
      <Grid
        container
        direction="row"
        maxWidth="xl"
        alignItems="center"
        marginY="100px"
        width="100%"
        marginX="auto"
      >
        <Grid item xs={6} textAlign="center">
          <Typography
            variant="h1"
            fontWeight="bold"
            color="success.main"
            marginBottom="20px"
          >
            TopSpin
          </Typography>
          <Typography variant="h3">advanced tennis analytics</Typography>
        </Grid>
        <Grid item xs={6}>
          <Box
            component="img"
            sx={{
              maxWidth: "sm",
              borderRadius: "50%",
            }}
            src="/src/assets/imgs/homepage.gif"
            title="gif of tennis player serving a ball"
          ></Box>
        </Grid>
      </Grid>
    </>
  );
}
