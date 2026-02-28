import React from "react";
import Card from "../components/Card";

export default function Home({ tracks, isLoading, message, resultOffset, setResultOffset, fetchMusicData }) {
  return (
    <>
      <div className="container">
        <div className={`row ${isLoading ? "" : "d-none"}`}>
          <div className="col-12 py-5 text-center">
            <div className="spinner-border" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>

        <div className="row">
          {tracks.map((element) => (
            <Card key={element.id} element={element} />
          ))}
        </div>

        <div className="row" hidden={tracks.length === 0}>
          <div className="col">
            <button
              onClick={() => {
                setResultOffset((previous) => previous - 20);
                fetchMusicData();
              }}
              className="btn btn-outline-success w-100"
              disabled={resultOffset === 0}
            >
              Previous Page: {resultOffset / 20 + 1}
            </button>
          </div>
          <div className="col">
            <button
              onClick={() => {
                setResultOffset((previous) => previous + 20);
                fetchMusicData();
              }}
              className="btn btn-outline-success w-100"
              disabled={tracks.length === 0}
            >
              Next Page: {resultOffset / 20 + 2}
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h4 className="text-center text-danger py-2">{message}</h4>
          </div>
        </div>

        <div className="row">
          <div className="col-12 py-5 text-center">
            <h1>
              <i className="bi bi-music-note-list mx-3"></i>
              v-music
            </h1>
            <h3 className="py-5">Discover music in 30 seconds</h3>
            <div>
              <a
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark"
                href="https://github.com/Vishesh-Pandey/v-music"
              >
                <i className="bi bi-github mx-2"></i>Github
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
