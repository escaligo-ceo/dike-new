import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Option,
} from "@fluentui/react-components";
import {
  Alert24Regular,
  ArrowLeft24Regular,
  CalendarDay24Regular,
  ContactCard24Regular,
  Navigation24Regular,
  Options24Regular,
  Search24Regular,
  Settings24Regular,
  SignOut24Regular,
} from "@fluentui/react-icons";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsDialog } from "../SettingsDialog";
import styles from "./TopBar.module.css";

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleToolsPanel: () => void;
  sidebarCollapsed: boolean;
  toolsPanelOpen: boolean;
}

function TopBar({
  onToggleSidebar,
  onToggleToolsPanel,
  toolsPanelOpen,
}: TopBarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDomain, setSearchDomain] = useState<string>("all");
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [avatarBlobUrls, setAvatarBlobUrls] = useState<Record<string, string>>(
    {}
  );
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Funzione per caricare l'avatar SVG con autenticazione
  const loadAvatarBlob = async (
    contactId: string,
    baseUrl: string
  ): Promise<string | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/contacts/${contactId}/avatar`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch avatar:", response.statusText);
        return null;
      }

      // Il backend restituisce già la data URL completa come stringa
      return await response.text();
    } catch (error) {
      console.error("Error loading avatar:", error);
      return null;
    }
  };

  // Funzione per costruire l'URL completo dell'avatar
  const getAvatarUrl = (
    avatarUrl: string | null | undefined,
    contactId: string | undefined,
    baseUrl: string
  ): string | null => {
    if (!avatarUrl) return null;

    // Se è un URL Gravatar completo, usalo direttamente
    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    }

    // Se è un percorso relativo ./contacts/{id}/avatar, carica tramite fetch con token
    if (avatarUrl.includes("./contacts/") && contactId) {
      return `LOAD_AVATAR:${contactId}:${baseUrl}`;
    }

    // Se inizia con ./, uniscilo al baseUrl
    if (avatarUrl.startsWith("./")) {
      return `${baseUrl.replace(/\/$/, "")}/${avatarUrl.substring(2)}`;
    }

    // Altrimenti uniscilo al baseUrl
    return `${baseUrl.replace(/\/$/, "")}/${avatarUrl}`;
  };

  // Mock function per ottenere i risultati di anteprima
  const fetchPreviewResults = async (query: string, domain: string) => {
    if (!query.trim()) {
      setPreviewResults([]);
      setShowPreview(false);
      return;
    }

    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      if (domain === "all" || domain === "contacts") {
        const response = await fetch(
          `${baseUrl.replace(/\/$/, "")}/v1/contacts/autocomplete?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Autocomplete error:", response.statusText);
          setPreviewResults([]);
          setShowPreview(false);
          return;
        }

        const data = await response.json();

        // Trasformiamo i risultati nel formato atteso
        const results = Array.isArray(data) ? data : data.items || [];
        const formatted = results.slice(0, 6).map((item: any) => ({
          id: item.id,
          type: "contact",
          name: item.displayName || `${item.firstName} ${item.lastName}`.trim(),
          email: item.email,
          avatarUrl: getAvatarUrl(item.avatarUrl, item.id, baseUrl),
          domain: "Contatti",
        }));

        setPreviewResults(formatted);

        // Carica gli avatar SVG con autenticazione
        const avatarsToLoad = formatted.filter(
          (result: any) =>
            result.avatarUrl &&
            result.avatarUrl.startsWith("LOAD_AVATAR:") &&
            !avatarBlobUrls[result.id]
        );

        if (avatarsToLoad.length > 0) {
          const newAvatars: Record<string, string> = {};
          await Promise.all(
            avatarsToLoad.map(async (result: any) => {
              const parts = result.avatarUrl.split(":");
              const contactId = parts[1];
              const baseUrlPart = parts.slice(2).join(":");
              const blobUrl = await loadAvatarBlob(contactId, baseUrlPart);
              if (blobUrl) {
                newAvatars[result.id] = blobUrl;
              }
            })
          );
          setAvatarBlobUrls((prev) => ({ ...prev, ...newAvatars }));
        }
        setShowPreview(formatted.length > 0);
      } else {
        // Per altri domini, al momento non mostriamo risultati
        setPreviewResults([]);
        setShowPreview(false);
      }
    } catch (error) {
      console.error("Failed to fetch autocomplete results:", error);
      setPreviewResults([]);
      setShowPreview(false);
    }
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchPreviewResults(value, searchDomain);
    }, 300);
  };

  const handleSearchCancel = () => {
    setSearchActive(false);
    setSearchQuery("");
    setSearchDomain("all");
    setPreviewResults([]);
    setShowPreview(false);
  };

  const getSearchPath = () => {
    const paths: Record<string, string> = {
      all: "/search",
      contacts: "/contacts/search",
      practices: "/practices/search",
      documents: "/documents/search",
      invoices: "/invoices/search",
    };
    return paths[searchDomain] || "/search";
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const path = getSearchPath();
      navigate(`${path}?q=${encodeURIComponent(searchQuery)}`);
      handleSearchCancel();
    }
  };

  const handlePreviewSelect = (result: any) => {
    if (result.type === "contact") {
      navigate("/contacts", {
        state: {
          contact: {
            id: result.id,
            fullName: result.name,
            emails: result.email ? [{ email: result.email }] : [],
            photoUrl: result.avatarUrl,
          },
        },
      });
    } else {
      const paths: Record<string, string> = {
        contact: "/contacts",
        practice: "/practices",
        invoice: "/invoices",
        document: "/documents",
      };
      const basePath = paths[result.type] || "/";
      navigate(`${basePath}/${result.id}`);
    }
    handleSearchCancel();
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("authToken");
    sessionStorage.clear();

    // Redirect to login page
    navigate("/login");
  };

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.leftSection}>
          <Button
            icon={<Navigation24Regular />}
            appearance="subtle"
            onClick={onToggleToolsPanel}
            aria-label="Strumenti e opzioni"
          />
          <h1 className={styles.logo}>Dike</h1>
        </div>
        <div className={styles.centerSection}>
          {!searchActive ? (
            <div
              className={styles.searchPlaceholder}
              onClick={() => setSearchActive(true)}
            >
              <Search24Regular className={styles.searchPlaceholderIcon} />
              <span className={styles.searchPlaceholderText}>
                Cerca Pratiche, Contatti, Documenti e Fatture.
              </span>
            </div>
          ) : (
            <div className={styles.searchActiveWrapper}>
              <div className={styles.searchActive}>
                <Button
                  icon={<ArrowLeft24Regular />}
                  appearance="subtle"
                  onClick={handleSearchCancel}
                  className={styles.searchBackButton}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchQueryChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className={styles.searchInput}
                  placeholder="Inserisci ricerca..."
                />
                <Dropdown
                  value={searchDomain}
                  onOptionSelect={(event, data) =>
                    setSearchDomain(data.optionValue || "all")
                  }
                  className={styles.searchDomainDropdown}
                >
                  <Option value="all">tutti</Option>
                  <Option value="practices">Pratiche</Option>
                  <Option value="contacts">Contatti</Option>
                  <Option value="documents">Documenti</Option>
                  <Option value="invoices">Fatture</Option>
                </Dropdown>
                <Button
                  icon={<Search24Regular />}
                  appearance="subtle"
                  onClick={handleSearch}
                  className={styles.searchExecuteButton}
                />
              </div>
              {showPreview && previewResults.length > 0 && (
                <div className={styles.previewDropdown}>
                  {previewResults.map((result, index) => {
                    const rawUrl =
                      avatarBlobUrls[result.id] || result.avatarUrl;
                    const imageUrl =
                      rawUrl && rawUrl.startsWith("LOAD_AVATAR:")
                        ? undefined
                        : rawUrl;
                    return (
                      <div
                        key={`preview-${searchQuery}-${index}`}
                        className={styles.previewItem}
                        onClick={() => handlePreviewSelect(result)}
                      >
                        {imageUrl ? (
                          <Avatar
                            name={result.name}
                            image={{ src: imageUrl }}
                            size={36}
                            shape="circular"
                          />
                        ) : (
                          <Avatar
                            name={result.name}
                            size={36}
                            shape="circular"
                          />
                        )}

                        <div className={styles.previewContent}>
                          <span className={styles.previewName}>
                            {result.name}
                          </span>
                          {result.email && (
                            <span className={styles.previewEmail}>
                              {result.email}
                            </span>
                          )}
                        </div>
                        <ContactCard24Regular
                          className={styles.previewTypeIcon}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.rightSection}>
          <Button
            icon={<CalendarDay24Regular />}
            appearance="subtle"
            aria-label="La mia giornata"
          />
          <div className={styles.notificationButton}>
            <Button
              icon={<Alert24Regular />}
              appearance="subtle"
              aria-label="Notifiche"
            />
            <Badge
              appearance="filled"
              color="danger"
              size="small"
              className={styles.badge}
            >
              5
            </Badge>
          </div>
          <Button
            icon={<Options24Regular />}
            appearance="subtle"
            aria-label="Impostazioni"
          />
          <Button
            icon={<Settings24Regular />}
            appearance="subtle"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          />
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Avatar name="Utente" size={32} style={{ cursor: "pointer" }} />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<SignOut24Regular />} onClick={handleLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </header>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export default TopBar;
