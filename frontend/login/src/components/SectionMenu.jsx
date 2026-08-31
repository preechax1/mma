import { useEffect, useState } from "react";
import styles from "./SectionMenu.module.css";
import { getSections } from "../services/sections";

export default function SectionMenu() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const result = await getSections();
        setSections(result || []);
      } catch (error) {
        console.error("Failed to load sections", error);
        setSections([]);
      }
    };

    loadSections();
  }, []);

  const handleClick = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className={styles.menuWrapper} aria-label="เมนูหน้า" >
      <ul className={styles.menuList}>
        {sections.map((section) => (
          <li key={section.id} className={styles.menuItem}>
            <a
              href={`#${section.id}`}
              className={styles.menuLink}
              onClick={(event) => handleClick(event, section.id)}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
