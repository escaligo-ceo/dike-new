import { Card, CardHeader, CardPreview } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import API_CONFIG from "../config/api";

interface DashboardData {
  contactsCount: number;
  invoicesCount: number;
  mattersCount: number;
  documentsCount: number;
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const contactsRes = await fetch(
          `${API_CONFIG.baseUrl.replace(/\/$/, "")}/v1/contacts/count`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Verifica che tutte le risposte siano ok
        if (!contactsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const contactsData = await contactsRes.json();
        // const invoicesData = await invoicesRes.json();
        // const mattersData = await mattersRes.json();
        // const documentsData = await documentsRes.json();

        setData({
          contactsCount: contactsData?.count || 0,
          invoicesCount: -1, //invoicesData?.count || 0,
          mattersCount: -1, //mattersData?.count || 0,
          documentsCount: -1, //documentsData?.count || 0,
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(
          "Errore nel caricamento dei dati della dashboard: " +
            (err as Error).message
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <h1>Dashboard</h1>
        <p>Caricamento dei dati in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <h1>Dashboard</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <div className={styles.cardGrid}>
        <Card className={styles.card}>
          <CardHeader
            header={<h3>Pratiche Attive</h3>}
            description="Numero di pratiche in corso"
          />
          <CardPreview className={styles.cardContent}>
            <div className={styles.statNumber}>
              {data?.mattersCount === -1 ? "?" : data?.mattersCount}
            </div>
          </CardPreview>
        </Card>

        <Card className={styles.card}>
          <CardHeader
            header={<h3>Contatti</h3>}
            description="Totale contatti"
          />
          <CardPreview className={styles.cardContent}>
            <div className={styles.statNumber}>
              {data?.contactsCount === -1 ? "?" : data?.contactsCount}
            </div>
          </CardPreview>
        </Card>

        <Card className={styles.card}>
          <CardHeader
            header={<h3>Documenti</h3>}
            description="Documenti caricati"
          />
          <CardPreview className={styles.cardContent}>
            <div className={styles.statNumber}>
              {data?.documentsCount === -1 ? "?" : data?.documentsCount}
            </div>
          </CardPreview>
        </Card>

        <Card className={styles.card}>
          <CardHeader
            header={<h3>Fatture</h3>}
            description="Fatture emesse questo mese"
          />
          <CardPreview className={styles.cardContent}>
            <div
              className={styles.statNumber}
            >
              {data?.invoicesCount === -1 ? "?" : data?.invoicesCount}
            </div>
          </CardPreview>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
