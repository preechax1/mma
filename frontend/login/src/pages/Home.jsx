import React, { useEffect, useState } from "react";
import HomeLayout from "../layouts/HomeLayout";
import ScrollSection from "../components/ScrollSection";
import UserInfoCard from "../components/UserInfoCard";
import AppCard from "../components/AppCard";
import { navigateToApp } from "../services/AppNavigationService";
import { getSections } from "../services/sections";
import styles from "./Home.module.css";

const APP_ROUTE_MAP = {
  "app-fec": "fec",
  "app-utilization": "test_utilization",
  "app-spare-parts": "spare_parts_management",
  "app-1st-yield": "yield",
};

export default function Home() {
  const [sections, setSections] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  const userData = localStorage.getItem("user");
  const user = userData && userData !== "undefined" ? JSON.parse(userData) : null;

  const displayName = user
    ? user.displayName || user.member || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || ""
    : "";

  useEffect(() => {
    const loadSections = async () => {
      try {
        const result = await getSections();
        if (Array.isArray(result)) {
          setSections(result);
          const hero = result.find((section) => section.id === "hero");
          if (hero) setHeroData(hero);
        }
      } catch (error) {
        console.error("Failed to load sections", error);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  const handleSelectApp = (app) => {
    navigateToApp(app, user?.token);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const appSections = sections.filter((section) => section.id.startsWith("app-"));

  return (
    <HomeLayout>
      <ScrollSection id="hero">
        <div className={styles.heroBox}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <p className={styles.heroBadge}>{heroData?.subtitle || "HANA MICROELECTRONICS PUBLIC COMPANY LIMITED"}</p>
              <h1 className={styles.heroTitle}>{heroData?.title || "OP3 MMA"}</h1>
              <p className={styles.heroSubtitle}>
                {heroData?.description || "ยินดีต้อนรับสู่ระบบ OP3 MMA Online"}
              </p>
              {heroData?.features && (
                <div className={styles.heroFeatures}>
                  <h3>Key Highlights</h3>
                  <ul>
                    {heroData.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className={styles.heroImageWrapper}>
              <img
                src={heroData?.img ? heroData.img : `${import.meta.env.BASE_URL}Hana_lpn.jpg`}
                alt={heroData?.title || "Hana LPN"}
                className={styles.heroImage}
              />
            </div>
          </div>
        </div>
      </ScrollSection>

      <ScrollSection id="user-info">
        <UserInfoCard user={user} displayName={displayName} onLogout={handleLogout} />
      </ScrollSection>

      {loading ? (
        <ScrollSection id="loading">
          <div className={styles.appSection}>
            <p>Loading applications...</p>
          </div>
        </ScrollSection>
      ) : (
        appSections.map((section) => {
          const appKey = section.appKey || APP_ROUTE_MAP[section.id] || null;
          const accent = section.id === "app-fec" ? "fec" : "test";
          return (
            <ScrollSection key={section.id} id={section.id}>
              <div className={styles.appSection}>
                <AppCard
                  title={section.title || section.label}
                  description={section.description || "รายละเอียดของแอปพลิเคชันนี้"}
                  accent={accent}
                  buttonLabel={section.buttonText || (appKey ? `เข้าใช้งาน ${section.label}` : "Coming Soon")}
                  onClick={() => appKey && handleSelectApp(appKey)}
                />
              </div>
            </ScrollSection>
          );
        })
      )}

    </HomeLayout>
  );
}
