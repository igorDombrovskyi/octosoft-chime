import { FC } from "react";
import { useEffect } from "react";
import styles from "./styles.module.scss";

type ImageModal = {
  show: boolean;
  content: string;
  handleClose: () => void;
  name: string;
};

export const ImageModal: FC<ImageModal> = ({
  show,
  handleClose,
  content,
  name,
}) => {
  const exit = (e: { key: string }) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", exit, false);

    return () => {
      document.removeEventListener("keydown", exit, false);
    };
  }, []);

  const showHideClassName = show ? styles.modal : styles.modalHidden;

  return (
    <div className={showHideClassName}>
      <section className={styles.modalMain}>
        <img src={content} alt="modal" />
        <button
          className={styles.closeModalBtn}
          type="button"
          onClick={handleClose}
        >
          <img src="./assets/x.svg" alt="close-icon" />
        </button>
      </section>

      <p className={styles.modalText}>{name}</p>
    </div>
  );
};
