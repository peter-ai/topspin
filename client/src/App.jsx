import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import NavBar from "./component/NavBar";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import NotFound from "./pages/NotFoundPage";
import MatchPage from "./pages/MatchPage";
import ComparePage from "./pages/ComparePage";
import TournamentHomePage from "./pages/TournamentHomePage";
import TournamentSelectedPage from "./pages/TournamentSelectedPage";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/player" element={<PlayerPage />} />
            <Route exact path="/player/:id" element={<PlayerProfilePage />} />
            <Route
              exact
              path="/tournament/:tourney_id/:match_num"
              element={<MatchPage />}
            />
            <Route exact path="/compare" element={<ComparePage />} />
            <Route exact path="/tournament" element={<TournamentHomePage />} />
            <Route exact path="/tournament/:id" element={<TournamentSelectedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* TODO: CREATE FOOTER */}
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
