import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { MusicContext } from "../Context";

const formatMs = (ms) => {
  if (!ms && ms !== 0) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function MusicDetails({ token }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { likedMusic, setLikedMusic, pinnedMusic, setPinnedMusic } = useContext(MusicContext);

  const [track, setTrack] = useState(location.state?.track || null);
  const [loading, setLoading] = useState(!location.state?.track);
  const [error, setError] = useState("");

  const artistName = useMemo(() => {
    if (!track) return "";
    return track.artists?.[0]?.name || track.album?.artists?.[0]?.name || "";
  }, [track]);

  const isLiked = useMemo(() => likedMusic?.some((t) => t.id === id), [likedMusic, id]);
  const isPinned = useMemo(() => pinnedMusic?.some((t) => t.id === id), [pinnedMusic, id]);

  const youtubeUrl = useMemo(() => {
    const q = encodeURIComponent(`${track?.name || ""} ${artistName}`.trim());
    return `https://www.youtube.com/results?search_query=${q}`;
  }, [track, artistName]);

  const spotifyUrl = useMemo(() => {
    return track?.external_urls?.spotify || track?.uri || "";
  }, [track]);

  const handleLike = () => {
    const current = Array.isArray(likedMusic) ? likedMusic : [];
    const exists = current.some((item) => item.id === id);
    const updated = exists ? current.filter((item) => item.id !== id) : [...current, track].filter(Boolean);
    setLikedMusic(updated);
    localStorage.setItem("likedMusic", JSON.stringify(updated));
  };

  const handlePin = () => {
    const current = Array.isArray(pinnedMusic) ? pinnedMusic : [];
    const exists = current.some((item) => item.id === id);
    const updated = exists ? current.filter((item) => item.id !== id) : [...current, track].filter(Boolean);
    setPinnedMusic(updated);
    localStorage.setItem("pinnedMusic", JSON.stringify(updated));
  };

  useEffect(() => {
    const run = async () => {
      if (track) return;
      if (!token) {
        setError("Spotify token ready nathi. 2-3 second pachi try karo.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Track not details fetch ");
        const data = await res.json();
        setTrack(data);
      } catch (e) {
        setError(e?.message || " error");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <button className="btn btn-outline-dark" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <Link to="/" className="btn btn-dark">
          <i className="bi bi-house-door me-2"></i>Home
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : !track ? (
        <div className="alert alert-warning">Track.</div>
      ) : (
        <div className="details-card shadow-sm">
          <div className="details-hero">
            <img
              src={track.album?.images?.[0]?.url}
              alt={track.name}
              className="details-cover"
            />
            <div className="details-meta">
              <h2 className="mb-2">{track.name}</h2>
              <div className="details-sub text-muted">
                <span className="me-3">
                  <i className="bi bi-person me-1"></i>{artistName || "-"}
                </span>
                <span className="me-3">
                  <i className="bi bi-disc me-1"></i>{track.album?.name || "-"}
                </span>
                <span>
                  <i className="bi bi-calendar3 me-1"></i>{track.album?.release_date || "-"}
                </span>
              </div>

              <div className="details-stats mt-3">
                <div className="stat">
                  <div className="stat-label">Duration</div>
                  <div className="stat-value">{formatMs(track.duration_ms)}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Popularity</div>
                  <div className="stat-value">{track.popularity ?? "-"}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Explicit</div>
                  <div className="stat-value">{track.explicit ? "Yes" : "No"}</div>
                </div>
              </div>

              <div className="details-actions mt-4 d-flex flex-wrap gap-2">
                <button onClick={handleLike} className="btn btn-outline-danger">
                  {isLiked ? (
                    <>
                      <i className="bi bi-heart-fill me-2"></i>Liked
                    </>
                  ) : (
                    <>
                      <i className="bi bi-heart me-2"></i>Like
                    </>
                  )}
                </button>

                <button onClick={handlePin} className="btn btn-outline-secondary">
                  {isPinned ? (
                    <>
                      <i className="bi bi-pin-angle-fill me-2"></i>Pinned
                    </>
                  ) : (
                    <>
                      <i className="bi bi-pin-angle me-2"></i>Pin
                    </>
                  )}
                </button>

                <a className="btn btn-success" href={spotifyUrl || "#"} target="_blank" rel="noreferrer" aria-disabled={!spotifyUrl}>
                  <i className="bi bi-spotify me-2"></i>Open in Spotify
                </a>

                <a className="btn btn-danger" href={youtubeUrl} target="_blank" rel="noreferrer">
                  <i className="bi bi-youtube me-2"></i>Search on YouTube
                </a>
              </div>

              <div className="mt-4">
                <div className="fw-semibold mb-2">Preview</div>
                {track.preview_url ? (
                  <audio src={track.preview_url} controls className="w-100" />
                ) : (
                  <div className="text-muted">this tarck not a show this song </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
