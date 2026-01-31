import { ReactNode, useState } from "react";
import styles from "./Layout.module.css";
import Sidebar from "./Sidebar";
import ToolsPanel from "./ToolsPanel";
import TopBar from "./TopBar";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toolsPanelOpen, setToolsPanelOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <TopBar
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleToolsPanel={() => setToolsPanelOpen(!toolsPanelOpen)}
        sidebarCollapsed={sidebarCollapsed}
        toolsPanelOpen={toolsPanelOpen}
      />
      <ToolsPanel
        open={toolsPanelOpen}
        onClose={() => setToolsPanelOpen(false)}
      />
      <Sidebar collapsed={sidebarCollapsed} />
      <main
        className={`${styles.mainContent} ${sidebarCollapsed ? styles.collapsed : ""}`}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;
