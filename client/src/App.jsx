import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import NotFound from "./pages/NotFoundPage";
import MatchPage from "./pages/MatchPage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return (
    <>
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
