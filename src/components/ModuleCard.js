import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/modulGeneral.module.css';

const ModuleCard = ({ name, moduleDescrip, icon, optionLinks }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      className={styles.containerCardMod}
      onClick={() => {
        setShowOptions(!showOptions);
      }}
    >
      <div className={styles.buttonHandleCard}>
        <span className={styles.titleCard}>
          {icon}
          <h3>{name}</h3>
        </span>
        {!showOptions && <i>{moduleDescrip}</i>}
      </div>
      {showOptions &&
        optionLinks.map((option) => {
          return (
            <>
              <Link
                key={option.idOption}
                href={option.route}
                className={styles.linkOptions}
              >
                <p>{option.descrip}</p>
              </Link>
            </>
          );
        })}
    </div>
  );
};

export default ModuleCard;
