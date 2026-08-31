import React from "react";
import styles from "./HomeLayout.module.css";
import SectionMenu from "../components/SectionMenu";

export default function HomeLayout({ children }) {
  return (
    <main className={styles.pageWrapper}>
      <SectionMenu />
      <div className={styles.scrollContainer}>{children}</div>
    </main>
  );
}
