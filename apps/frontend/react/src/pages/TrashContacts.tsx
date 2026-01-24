import type { IContact } from "@dike/contracts";
import type { MenuButtonProps } from "@fluentui/react-components";
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tab,
  TabList,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
} from "@fluentui/react-components";
import {
  ArrowExport24Regular,
  Delete24Regular,
  Eye20Regular,
  Home20Regular,
  MoreVertical24Regular,
  Navigation20Regular,
  QuestionCircle20Regular,
  Share24Regular,
} from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadContactAvatarBlob } from "./Contacts";
import styles from "./Contacts.module.css";

function TrashContacts() {
  const [trashContacts, setTrashContacts] = useState<IContact[]>([]);
  const [editingContact, setEditingContact] = useState<IContact | null>(null);
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);
  const [avatarBlobUrls, setAvatarBlobUrls] = useState<Record<string, string>>(
    {}
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trashHasMore, setTrashHasMore] = useState(true);
  const [trashPage, setTrashPage] = useState(1);
  const [trashTotal, setTrashTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const navigate = useNavigate();

  const loadMoreTrashContacts = async (pageNum: number) => {
    if (loading || isRestoring) return;

    try {
      setLoading(true);
      setError(null);

      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/contacts/trash?page=${pageNum}&limit=25`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load contacts");
      }

      const data = await response.json();
      const newContacts = data.items || [];

      setTrashTotal(data.total || 0);

      if (newContacts.length === 0) {
        setTrashHasMore(false);
      } else {
        setTrashContacts((prev) => {
          // Deduplicate: crea un Set degli ID già presenti e filtra i nuovi contatti
          const existingIds = new Set(prev.map((c) => c.id));
          const uniqueNewContacts = newContacts.filter(
            (c: IContact) => !existingIds.has(c.id)
          );
          return [...prev, ...uniqueNewContacts];
        });

        // Carica gli avatar SVG per i contatti senza photoUrl
        const newAvatarBlobUrls: Record<string, string> = { ...avatarBlobUrls };
        for (const contact of newContacts) {
          if (!contact.photoUrl && !newAvatarBlobUrls[contact.id]) {
            loadContactAvatarBlob(contact.id, true).then((blobUrl) => {
              if (blobUrl) {
                setAvatarBlobUrls((prev) => ({
                  ...prev,
                  [contact.id]: blobUrl,
                }));
              }
            });
          }
        }

        setTrashPage(pageNum + 1);
      }
    } catch (err) {
      setError("Errore nel caricamento dei contatti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editingContact && !editingContact.photoUrl) {
      const editingContactId = editingContact.id;
      if (!editingContactId) {
        throw new Error("Contact ID is missing");
      }
      loadContactAvatarBlob(editingContactId, true).then((blobUrl) => {
        if (blobUrl) {
          setAvatarBlobUrl(blobUrl);
        }
      });
    } else {
      setAvatarBlobUrl(null);
    }
  }, [editingContact]);

  // Load trash contacts on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      loadMoreTrashContacts(1);
    }
  }, []);

  // Intersection Observer per infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isRestoring) {
          if (trashHasMore) {
            loadMoreTrashContacts(trashPage);
          }
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [trashHasMore, loading, trashPage, isRestoring]);

  const handleSelectContact = (contact: IContact) => {
    setEditingContact(contact);
  };

  const handleRestoreContact = async () => {
    if (!editingContact) return;

    if (
      !window.confirm(
        `Sei sicuro di voler ripristinare ${editingContact.fullName || editingContact.firstName}?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setIsRestoring(true);
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      const restoreUrl = `${baseUrl.replace(/\/$/, "")}/v1/contacts/${editingContact.id}/restore`;
      console.log("Ripristinando contatto da URL:", restoreUrl);

      const response = await fetch(restoreUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Risposta RESTORE:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Errore della risposta:", errorText);
        throw new Error(
          `Errore nel ripristino del contatto (${response.status}): ${errorText}`
        );
      }

      // Naviga alla pagina contatti e apri il contatto in modifica
      navigate("/contacts", {
        state: {
          contactToEdit: { ...editingContact, deletedAt: null },
        },
      });
    } catch (err) {
      console.error("Errore nel ripristino:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore nel ripristino del contatto"
      );
    } finally {
      setLoading(false);
      setIsRestoring(false);
    }
  };

  return (
    <div className={styles.contacts}>
      <div className={styles.tablistContainer}>
        <Button
          icon={<Navigation20Regular />}
          appearance="subtle"
          size="small"
          className={styles.burgerButton}
        />
        <TabList size="small">
          <Tab value="home" icon={<Home20Regular />}>
            Home
          </Tab>
          <Tab value="view" icon={<Eye20Regular />}>
            View
          </Tab>
          <Tab value="help" icon={<QuestionCircle20Regular />}>
            Help
          </Tab>
        </TabList>
      </div>

      <Toolbar>
        <ToolbarButton
          icon={<Delete24Regular />}
          disabled={!editingContact}
          onClick={handleRestoreContact}
        >
          Ripristina
        </ToolbarButton>
        <ToolbarDivider />

        <Menu positioning="below-end">
          <MenuTrigger disableButtonEnhancement>
            {(triggerProps: MenuButtonProps) => (
              <MenuButton
                {...triggerProps}
                icon={<MoreVertical24Regular />}
                disabled={!editingContact}
              />
            )}
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              <MenuItem icon={<Share24Regular />}>Condividi</MenuItem>
              <MenuItem icon={<ArrowExport24Regular />}>
                Nuova lista contatti
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </Toolbar>

      <div className={styles.mainContainer}>
        <div className={styles.listPanel}>
          <div style={{ padding: "10px", fontWeight: "bold" }}>
            Cestino ({trashTotal})
          </div>
          {error && (
            <div
              style={{
                padding: "1rem",
                color: "red",
                marginBottom: "1rem",
                fontSize: "12px",
              }}
            >
              {error}
            </div>
          )}
          {loading && trashContacts.length === 0 && (
            <div
              style={{
                padding: "1rem",
                color: "#666",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              Caricamento contatti...
            </div>
          )}
          {!loading && trashContacts.length === 0 && !error && (
            <div
              style={{
                padding: "1rem",
                color: "#999",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              Nessun contatto nel cestino
            </div>
          )}
          <div className={styles.navDrawerContent}>
            {trashContacts.map((contact) => {
              const contactId = contact.id;
              if (!contactId) {
                throw new Error("Contact ID is missing");
              }
              const imageUrl = contact.photoUrl || avatarBlobUrls[contactId];
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`${styles.navDrawerItem} ${
                    editingContact?.id === contact.id ? styles.selected : ""
                  }`}
                >
                  {imageUrl ? (
                    <Avatar
                      name={
                        contact.fullName ||
                        `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                      }
                      image={{ src: imageUrl }}
                      size={36}
                      shape="circular"
                    />
                  ) : (
                    <Avatar
                      name={
                        contact.fullName ||
                        `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                      }
                      size={36}
                      shape="circular"
                    />
                  )}
                  <div className={styles.navItemContent}>
                    <div className={styles.navItemName}>
                      {contact.fullName ||
                        `${contact.firstName || ""} ${contact.lastName || ""}`}
                    </div>
                    {contact.company?.title || contact.company ? (
                      <div className={styles.navItemSubtitle}>
                        {contact.company?.title && (
                          <span>{contact.company.title}</span>
                        )}
                        {contact.company?.title && contact.company && (
                          <span> presso </span>
                        )}
                        {contact.company && (
                          <span>
                            {typeof contact.company === "string"
                              ? contact.company
                              : contact.company.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      contact.emails &&
                      contact.emails.length > 0 && (
                        <div className={styles.navItemSubtitle}>
                          {
                            (
                              contact.emails.find((e) => e.isPreferred) ||
                              contact.emails[0]
                            )?.email
                          }
                        </div>
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div ref={observerTarget} style={{ height: "20px" }} />
        </div>

        <div className={styles.detailPanel}>
          {editDialogOpen && editingContact ? (
            <div className={styles.editPanel}>
              <div className={styles.editPanelHeader}>
                <h2>Dettagli Contatto</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setEditDialogOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.editPanelContent}>
                {editingContact.photoUrl || avatarBlobUrl ? (
                  <Avatar
                    name={
                      editingContact.fullName ||
                      `${editingContact.firstName || ""} ${editingContact.lastName || ""}`.trim()
                    }
                    image={{
                      src: editingContact.photoUrl || avatarBlobUrl || "",
                    }} // <- CORRETTO
                    size={96}
                    shape="circular"
                  />
                ) : (
                  <Avatar
                    name={
                      editingContact.fullName ||
                      `${editingContact.firstName || ""} ${editingContact.lastName || ""}`.trim()
                    }
                    size={96}
                    shape="circular"
                  />
                )}
                <h3>{editingContact.fullName}</h3>
                <p>Email: {editingContact.emails?.[0]?.email}</p>
              </div>
            </div>
          ) : editingContact ? (
            <div className={styles.viewPanel}>
              <div className={styles.viewHeader}>
                <h2>
                  {editingContact.fullName ||
                    `${editingContact.firstName} ${editingContact.lastName}`}
                </h2>
                {(editingContact.company?.title ||
                  (typeof editingContact.company === "string"
                    ? editingContact.company
                    : editingContact.company?.name)) && (
                  <div className={styles.detailSubtitle}>
                    {editingContact.company?.title && (
                      <span>{editingContact.company.title}</span>
                    )}
                    {editingContact.company?.title && <span> presso </span>}
                    {editingContact.company?.name && (
                      <span>{editingContact.company?.name}</span>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.viewContent}>
                <Avatar
                  name={
                    editingContact.fullName ||
                    `${editingContact.firstName || ""} ${editingContact.lastName || ""}`.trim()
                  }
                  image={
                    editingContact.photoUrl || avatarBlobUrl
                      ? { src: editingContact.photoUrl || avatarBlobUrl }
                      : undefined
                  }
                  size={120}
                  shape="circular"
                  style={{ fontSize: "48px" }}
                />
                {editingContact.company && (
                  <div>
                    <h4>Azienda</h4>
                    <p>
                      {typeof editingContact.company === "string"
                        ? editingContact.company
                        : editingContact.company.name}
                    </p>
                    {typeof editingContact.company !== "string" &&
                      editingContact.company?.title && (
                        <p style={{ color: "#666", fontSize: "0.9em" }}>
                          {editingContact.company.title}
                        </p>
                      )}
                  </div>
                )}
                {editingContact.emails && editingContact.emails.length > 0 && (
                  <div>
                    <h4>Email</h4>
                    {editingContact.emails.map((email) => (
                      <p key={email.id}>{email.email}</p>
                    ))}
                  </div>
                )}
                {editingContact.phones && editingContact.phones.length > 0 && (
                  <div>
                    <h4>Telefoni</h4>
                    {editingContact.phones.map((phone) => (
                      <p key={phone.id}>{phone.number}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyPanel}>
              <p>Seleziona un contatto per visualizzare i dettagli</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrashContacts;
