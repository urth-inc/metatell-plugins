import classNames from "classnames";
import React from "react";

import questionMark from "./question_mark.png";

import { IndicatorIcon } from "./IndicatorIcon";

import * as styles from "./PasswordCollectionModal.module.scss";

import { useFoundPasswords } from "./useFoundPasswords";

import { useToggle } from "../../hooks/useToggle";

export const PasswordCollectionModal: React.FC = () => {
  const [isOpen, toggleIsOpen] = useToggle(false);
  const { foundPasswords } = useFoundPasswords();
  const foundPasswordsMap = new Map(
    foundPasswords.map((password: { index: number; imgSrc: string }) => [
      password.index,
      password,
    ]),
  );

  const displayPasswords = [
    {
      index: 0,
      src: foundPasswordsMap.get(0)?.imgSrc || questionMark,
      description: "1つ目のパスワード",
    },
    {
      index: 1,
      src: foundPasswordsMap.get(1)?.imgSrc || questionMark,
      description: "2つ目のパスワード",
    },
    {
      index: 2,
      src: foundPasswordsMap.get(2)?.imgSrc || questionMark,
      description: "3つ目のパスワード",
    },
  ];

  return (
    <div
      data-mt="PasswordCollectionModal"
      className={styles.passwordListContainer}
    >
      <button
        className={classNames(
          styles.passwordMenuButton,
          isOpen ? "opened" : "closed",
        )}
        onClick={toggleIsOpen}
      >
        <div className={styles.passwordMenuButtonTitle}>見つけたパスワード</div>
        <div
          className={
            isOpen
              ? styles.activePasswordMenuButtonIcon
              : styles.passwordMenuButtonIcon
          }
        >
          <IndicatorIcon />
        </div>
      </button>
      <div
        className={classNames(
          styles.passwordMenuBody,
          isOpen ? "opened" : "closed",
        )}
      >
        <hr />
        {displayPasswords.map((password) => {
          return (
            <React.Fragment key={password.index}>
              <div>
                <div>
                  <img src={password.src} alt="" draggable="false" />
                </div>
                <div>{password.description}</div>
              </div>
              <hr />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
