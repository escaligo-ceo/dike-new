import { Button } from "@fluentui/react-components";
import {
  Calculator24Regular,
  CalendarClock24Regular,
  DataTrending24Regular,
  DocumentPercent24Regular,
  Money24Regular,
  Receipt24Regular,
} from "@fluentui/react-icons";
import styles from "./ToolsPanel.module.css";

interface ToolsPanelProps {
  open: boolean;
  onClose: () => void;
}

function ToolsPanel({ open }: ToolsPanelProps) {
  if (!open) return null;

  return (
    <div className={styles.toolsPanel}>
      <div className={styles.panelHeader}>
        <h3>Strumenti di Calcolo</h3>
      </div>
      <div className={styles.toolsList}>
        <Button
          appearance="subtle"
          icon={<DocumentPercent24Regular />}
          className={styles.toolButton}
        >
          Interessi Legali
        </Button>

        <Button
          appearance="subtle"
          icon={<Receipt24Regular />}
          className={styles.toolButton}
        >
          Interessi di Mora
        </Button>

        <Button
          appearance="subtle"
          icon={<DataTrending24Regular />}
          className={styles.toolButton}
        >
          Indici ISTAT
        </Button>

        <Button
          appearance="subtle"
          icon={<Calculator24Regular />}
          className={styles.toolButton}
        >
          Calcolo Codice Fiscale
        </Button>

        <Button
          appearance="subtle"
          icon={<Money24Regular />}
          className={styles.toolButton}
        >
          Rivalutazione Monetaria
        </Button>

        <Button
          appearance="subtle"
          icon={<Money24Regular />}
          className={styles.toolButton}
        >
          Svalutazione Monetaria
        </Button>

        <Button
          appearance="subtle"
          icon={<CalendarClock24Regular />}
          className={styles.toolButton}
        >
          Calcolo Termini Processuali
        </Button>

        <Button
          appearance="subtle"
          icon={<Calculator24Regular />}
          className={styles.toolButton}
        >
          Calcolo Spese Legali
        </Button>
      </div>
    </div>
  );
}

export default ToolsPanel;
