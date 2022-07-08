import React, { FC, ReactNode } from "react";
import classNames from "classnames";
import styles from "./styles.module.scss";

type Button = {
  containerStyles?: string;
  children: ReactNode;
  onPress: () => void;
};

export const Button: FC<Button> = ({ children, containerStyles, onPress }) => {
  const handlePress = (e) => {
    e.preventDefault();
    onPress?.();
  };
  return (
    <button
      onClick={handlePress}
      className={classNames(styles.container, containerStyles)}
    >
      {children}
    </button>
  );
};
