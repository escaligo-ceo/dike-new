import {
  CalendarLtr24Regular,
  DataBarVertical24Regular,
  DocumentBulletList24Regular,
  Folder24Regular,
  Money24Regular,
  People24Regular,
} from "@fluentui/react-icons";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  collapsed: boolean;
}

function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <nav className={styles.nav}>
        <Link to="/dashboard" className={styles.navItem}>
          <DataBarVertical24Regular className={styles.icon} />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        <div className={styles.navGroup}>
          <div className={styles.navGroupHeader}>
            <Folder24Regular className={styles.icon} />
            {!collapsed && <span>Pratiche</span>}
          </div>
          {!collapsed && (
            <div className={styles.navSubmenu}>
              <Link to="/pratiche/nuova" className={styles.navSubitem}>
                Nuova pratica
              </Link>
              <Link to="/pratiche/mie" className={styles.navSubitem}>
                Le mie pratiche
              </Link>
              <Link to="/pratiche/archivio" className={styles.navSubitem}>
                Archivio
              </Link>
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navGroupHeader}>
            <People24Regular className={styles.icon} />
            {!collapsed && <span>Contatti</span>}
          </div>
          {!collapsed && (
            <div className={styles.navSubmenu}>
              <Link to="/contacts" className={styles.navSubitem}>
                Gestione Contatti
              </Link>
              <Link to="/contacts/trash" className={styles.navSubitem}>
                Cestino
              </Link>
            </div>
          )}
        </div>

        <Link to="/documenti" className={styles.navItem}>
          <DocumentBulletList24Regular className={styles.icon} />
          {!collapsed && <span>Documenti</span>}
        </Link>

        <Link to="/calendario" className={styles.navItem}>
          <CalendarLtr24Regular className={styles.icon} />
          {!collapsed && <span>Calendario</span>}
        </Link>

        <Link to="/fatturazione" className={styles.navItem}>
          <Money24Regular className={styles.icon} />
          {!collapsed && <span>Fatturazione</span>}
        </Link>

        <Link to="/report" className={styles.navItem}>
          <DataBarVertical24Regular className={styles.icon} />
          {!collapsed && <span>Report</span>}
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
