import "./App.css";
import { useContext, useEffect, useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { initializePlaylist } from "./initialize";
import Navbar from "./components/Navbar";
import { MusicContext } from "./Context";
import Home from "./pages/Home";
import MusicDetails from "./components/MusicDetails";

function App() {
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [tracks, setTracks] = useState([]);
  const [token, setToken] = useState(null);

  const musicContext = useContext(MusicContext);
  const isLoading = musicContext.isLoading;
  const setIsLoading = musicContext.setIsLoading;
  const setLikedMusic = musicContext.setLikedMusic;
  const setpinnedMusic = musicContext.setPinnedMusic;
  const resultOffset = musicContext.resultOffset;
  const setResultOffset = musicContext.setResultOffset;

  const fetchMusicData = useCallback(async () => {
    if (!keyword.trim()) return;
    if (!token) {
      setMessage("Spotify token ready nathi. 2-3 second pachi try karo.");
      return;
    }

    setTracks([]);
    window.scrollTo(0, 0);
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=track&offset=${resultOffset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch music data");
      }

      const jsonData = await response.json();
      setTracks(jsonData.tracks.items || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, token, resultOffset, setIsLoading]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setResultOffset(0);
      fetchMusicData();
    }
  };

  useEffect(() => {
    initializePlaylist();

    // current client credentials will be deleted in few days
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials&client_id=a77073181b7d48eb90003e3bb94ff88a&client_secret=68790982a0554d1a83427e061e371507",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const jsonData = await response.json();
        setToken(jsonData.access_token);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
    setLikedMusic(JSON.parse(localStorage.getItem("likedMusic")));
    setpinnedMusic(JSON.parse(localStorage.getItem("pinnedMusic")));
  }, [setIsLoading, setLikedMusic, setpinnedMusic]);

  return (
    <>
      <Navbar
        keyword={keyword}
        setKeyword={setKeyword}
        handleKeyPress={handleKeyPress}
        fetchMusicData={fetchMusicData}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              tracks={tracks}
              isLoading={isLoading}
              message={message}
              resultOffset={resultOffset}
              setResultOffset={setResultOffset}
              fetchMusicData={fetchMusicData}
            />
          }
        />
        <Route path="/track/:id" element={<MusicDetails token={token} />} />
      </Routes>
    </>
  );
}

export default App;