import React, { useEffect } from "react";
import "./index.css";

export default function ImageModal(props) {
  const exit = (e) => {
    if (e.key === "Escape") {
      props.handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", exit, false);

    return () => {
      document.removeEventListener("keydown", exit, false);
    };
  }, []);

  const showHideClassName = props.show
    ? "modal display-block"
    : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <img src={props.content} alt="modal" />
        <button
          className="close-modal-btn"
          type="button"
          onClick={props.handleClose}
        >
          <img src="./assets/x.svg" alt="close-icon" />
        </button>
      </section>

      <p className="modal-text">{props.name}</p>
    </div>
  );
}
