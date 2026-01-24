import { type IContact, type TaxIdentifierType } from "@dike/contracts";
import type { MenuButtonProps } from "@fluentui/react-components";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Option,
  SplitButton,
  Tab,
  TabList,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowExport24Regular,
  ArrowImport24Regular,
  Call24Regular,
  Delete24Regular,
  Edit24Regular,
  Eye20Regular,
  Home20Regular,
  Mail24Regular,
  Navigation20Regular,
  People24Regular,
  Person24Regular,
  Person48Regular,
  QuestionCircle20Regular,
} from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ImportContactsDialog } from "../components/ImportContacts";
import styles from "./Contacts.module.css";

export async function loadContactAvatarBlob(
  contactId: string,
  deleted: boolean = false
): Promise<string | null> {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const baseUrl =
      (import.meta as any).env?.API_GATEWAY_BASE_URL ||
      "http://localhost:3000/api";

    const queryString = deleted ? "?deleted=true" : "";

    const response = await fetch(
      `${baseUrl}/v1/contacts/${contactId}/avatar${queryString}`,
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

    // Il backend restituisce già la data URL completa
    const dataUri = await response.text();

    return dataUri;
  } catch (error) {
    console.error("Error loading avatar:", error);
    return null;
  }
}

function Contacts() {
  // Elimina definitivamente un contatto dal cestino
  const handlePermanentDeleteContact = async (contactId: string) => {
    if (!contactId) return;
    if (
      !window.confirm(
        "Sei sicuro di voler eliminare definitivamente questo contatto? L'operazione non è reversibile."
      )
    ) {
      return;
    }
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) return null;

      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      const response = await fetch(
        `${baseUrl}/v1/contacts/trash/${contactId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Errore nell'eliminazione definitiva (${response.status}): ${errorText}`
        );
      }

      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore nell'eliminazione definitiva del contatto"
      );
    } finally {
      setLoading(false);
    }
  };

  const [contacts, setContacts] = useState<IContact[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<IContact | null>(null);
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);
  const [avatarBlobUrls, setAvatarBlobUrls] = useState<Record<string, string>>(
    {}
  );
  const [visibleNameFields, setVisibleNameFields] = useState<Set<string>>(
    new Set(["firstName", "lastName"])
  );
  const [openEmailFormIds, setOpenEmailFormIds] = useState<Set<string>>(
    new Set()
  );
  const [emailInputValues, setEmailInputValues] = useState<
    Record<string, string>
  >({});
  const [openChatFormIds, setOpenChatFormIds] = useState<Set<string>>(
    new Set()
  );
  const [chatInputValues, setChatInputValues] = useState<
    Record<string, string>
  >({});
  const [openCompanyFormIds, setOpenCompanyFormIds] = useState<Set<string>>(
    new Set()
  );
  const [companyFormValues, setCompanyFormValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [companyFormTypes, setCompanyFormTypes] = useState<
    Record<string, string>
  >({});
  const [openPhoneTypes, setOpenPhoneTypes] = useState<Set<string>>(new Set());
  const [phoneInputValues, setPhoneInputValues] = useState<
    Record<string, string>
  >({});
  const [openAddressFormIds, setOpenAddressFormIds] = useState<Set<string>>(
    new Set()
  );
  const [addressFormValues, setAddressFormValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [addressFormTypes, setAddressFormTypes] = useState<
    Record<string, string>
  >({});
  const [openTaxIdentifierFormIds, setOpenTaxIdentifierFormIds] = useState<
    Set<string>
  >(new Set());
  const [taxIdentifierInputValues, setTaxIdentifierInputValues] = useState<
    Record<string, string>
  >({});
  const [taxIdentifierFormTypes, setTaxIdentifierFormTypes] = useState<
    Record<string, string>
  >({});
  const [openCompanyTaxIdentifierFormIds, setOpenCompanyTaxIdentifierFormIds] =
    useState<Set<string>>(new Set());
  const [companyTaxIdentifierInputValues, setCompanyTaxIdentifierInputValues] =
    useState<Record<string, string>>({});
  const [companyTaxIdentifierFormTypes, setCompanyTaxIdentifierFormTypes] =
    useState<Record<string, string>>({});

  const [showWebPage, setShowWebPage] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [showAnniversary, setShowAnniversary] = useState(false);
  const [showBirthPlace, setShowBirthPlace] = useState(false);
  const [showGender, setShowAnagraphicSex] = useState(false);
  const [showCategorize, newCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const location = useLocation();

  const loadContactDetails = async (contactId: string) => {
    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/contacts/${contactId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to load contact details");
        return;
      }

      const fullContact = await response.json();
      setEditingContact(fullContact);
      setContacts((prev) =>
        prev.map((c) => (c.id === fullContact.id ? fullContact : c))
      );
    } catch (err) {
      console.error("Error loading contact details:", err);
    }
  };

  useEffect(() => {
    const state = location.state as {
      contactToEdit?: IContact;
      contact?: IContact;
    } | null;

    if (state?.contactToEdit || state?.contact) {
      const contact = state.contactToEdit || state.contact!;
      const isEditMode = !!state.contactToEdit;

      setEditingContact(contact);
      setEditDialogOpen(isEditMode);

      if (isEditMode) {
        // Imposta i campi visibili per la modifica
        const fieldsToShow = new Set(["firstName", "lastName"]);
        if (contact.middleName) fieldsToShow.add("middleName");
        if (contact.prefix) fieldsToShow.add("prefix");
        if (contact.suffix) fieldsToShow.add("suffix");
        if (contact.nickname) fieldsToShow.add("nickname");
        if (contact.phoneticFirstName) fieldsToShow.add("phoneticFirstName");
        if (contact.phoneticLastName) fieldsToShow.add("phoneticLastName");
        setVisibleNameFields(fieldsToShow);
      } else {
        // Solo se NON stiamo creando un nuovo contatto (quindi serve l'id)
        const contactId = contact.id;
        if (contactId) {
          // Se siamo in visualizzazione (es. da ricerca), carichiamo i dettagli completi
          loadContactDetails(contactId);
        }
        // Se non c'è id, non fare nulla (nuovo contatto)
      }

      setContacts((prev) => {
        if (prev.some((c) => c.id === contact.id)) return prev;
        return [contact, ...prev];
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadMoreContacts = async (pageNum: number) => {
    if (loading || isDeleting) return;

    try {
      setLoading(true);
      setError(null);

      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/contacts?page=${pageNum}&limit=25`,
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

      setTotal(data.total || 0);

      if (newContacts.length < 25) {
        setHasMore(false);
      }

      if (newContacts.length > 0) {
        setContacts((prev) => {
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
            loadContactAvatarBlob(contact.id).then((blobUrl) => {
              if (blobUrl) {
                setAvatarBlobUrls((prev) => ({
                  ...prev,
                  [contact.id]: blobUrl,
                }));
              }
            });
          }
        }

        setPage(pageNum + 1);
      }
    } catch (err) {
      setError("Errore nel caricamento dei contatti");
    } finally {
      setLoading(false);
    }
  };

  // Carica l'avatar quando il contatto viene selezionato
  useEffect(() => {
    if (
      editingContact &&
      !editingContact.photoUrl &&
      editingContact.id // Only load avatar if id exists (i.e., not a new contact)
    ) {
      loadContactAvatarBlob(editingContact.id).then((blobUrl) => {
        if (blobUrl) {
          setAvatarBlobUrl(blobUrl);
        }
      });
    } else {
      setAvatarBlobUrl(null);
    }
  }, [editingContact]);

  // Carica i contatti iniziali (solo la prima pagina)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      loadMoreContacts(1);
    }
  }, []);

  // Intersection Observer per infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isDeleting && !error) {
          if (hasMore) {
            loadMoreContacts(page);
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
  }, [hasMore, loading, page, isDeleting, error]);

  const handleSelectContact = (contact: IContact) => {
    setEditingContact(contact);
  };

  const handleAddNameField = (fieldName: string) => {
    setVisibleNameFields((prev) => new Set([...prev, fieldName]));
  };

  const handleEditContact = () => {
    if (editingContact) {
      setEditingContact({ ...editingContact });
      setEditDialogOpen(true);
      // Reset visible fields when opening edit, then add fields that have values
      const fieldsToShow = new Set(["firstName", "lastName"]);
      if (editingContact.middleName) fieldsToShow.add("middleName");
      if (editingContact.prefix) fieldsToShow.add("prefix");
      if (editingContact.suffix) fieldsToShow.add("suffix");
      if (editingContact.nickname) fieldsToShow.add("nickname");
      if (editingContact.phoneticFirstName)
        fieldsToShow.add("phoneticFirstName");
      if (editingContact.phoneticLastName) fieldsToShow.add("phoneticLastName");
      setVisibleNameFields(fieldsToShow);
    }
  };

  const handleCreateNewContact = () => {
    setEditingContact({
      firstName: "",
      lastName: "",
      emails: [],
      phones: [],
      addresses: [],
      taxIdentifiers: [],
    } as IContact);
    setEditDialogOpen(true);
    setVisibleNameFields(new Set(["firstName", "lastName"]));
  };

  // Funzione per trimmarre ricorsivamente tutti i campi string
  const trimObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => trimObject(item));
    }

    if (typeof obj === "object") {
      const trimmedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          trimmedObj[key] = trimObject(obj[key]);
        }
      }
      return trimmedObj;
    }

    return obj;
  };

  const handleSaveContact = async () => {
    if (!editingContact) return;

    try {
      setLoading(true);
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      // Trimma tutti i campi del contatto
      const trimmedContact = trimObject(editingContact);

      const isNew = !editingContact.id;
      const url = isNew
        ? `${baseUrl.replace(/\/$/, "")}/v1/contacts`
        : `${baseUrl.replace(/\/$/, "")}/v1/contacts/${editingContact.id}`;

      if (isNew && trimmedContact.id === "") {
        delete trimmedContact.id;
      }
      delete trimmedContact.color;

      const response = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(trimmedContact),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Errore della risposta:", errorText);
        throw new Error(
          `Errore nel salvataggio del contatto (${response.status}): ${errorText}`
        );
      }

      const savedContact = await response.json();

      // Aggiorna il contatto nella lista con i dati appena salvati
      if (isNew) {
        setContacts((prev) => [savedContact, ...prev]);
        setTotal((prev) => prev + 1);
      } else {
        setContacts((prev) =>
          prev.map((c) => (c.id === savedContact.id ? savedContact : c))
        );
      }

      // Se il BE ha fornito una nuova photoUrl, aggiorna l'avatar nella lista
      if (savedContact.id && savedContact.photoUrl) {
        setAvatarBlobUrls((prev) => ({
          ...prev,
          [savedContact.id]: savedContact.photoUrl,
        }));
      } else if (savedContact.id) {
        // Se non c'è photoUrl, ricarica l'avatar SVG
        loadContactAvatarBlob(savedContact.id).then((blobUrl) => {
          if (blobUrl) {
            setAvatarBlobUrls((prev) => ({
              ...prev,
              [savedContact.id]: blobUrl,
            }));
          }
        });
      }

      // Aggiorna editingContact con i dati salvati
      setEditingContact(savedContact);

      setError(null);
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore nel salvataggio del contatto"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!editingContact || !editingContact.id) return;

    if (
      !window.confirm(
        `Sei sicuro di voler eliminare ${editingContact.fullName || editingContact.firstName}?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setIsDeleting(true);
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";

      const deleteUrl = `${baseUrl.replace(/\/$/, "")}/v1/contacts/${editingContact.id}`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Errore della risposta:", errorText);
        throw new Error(
          `Errore nell'eliminazione del contatto (${response.status}): ${errorText}`
        );
      }

      // Calcola quale contatto selezionare prima di rimuovere
      const deletedIndex = contacts.findIndex(
        (c) => c.id === editingContact.id
      );
      let nextContact: IContact | null = null;

      if (contacts.length > 1) {
        if (deletedIndex < contacts.length - 1) {
          // C'è un contatto dopo quello eliminato
          nextContact = contacts[deletedIndex + 1];
        } else if (deletedIndex > 0) {
          // Non c'è nessuno dopo, ma c'è qualcuno prima
          nextContact = contacts[deletedIndex - 1];
        }
      }

      // Chiudi il dialog PRIMA di aggiornare lo stato
      setEditDialogOpen(false);

      // Seleziona il prossimo contatto
      if (nextContact) {
        setEditingContact(nextContact);
      } else {
        setEditingContact(null);
      }

      // Rimuovi il contatto dalla lista (ULTIMO per avere priorità di render)
      setContacts(contacts.filter((c) => c.id !== editingContact.id));
      setTotal(Math.max(0, total - 1));

      setError(null);
    } catch (err) {
      console.error("Errore nell'eliminazione:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore nell'eliminazione del contatto"
      );
    } finally {
      setLoading(false);
      setIsDeleting(false);
    }
  };

  const handleAddPhone = (phoneType: string) => {
    const phoneNumber = phoneInputValues[phoneType]?.trim();
    if (phoneNumber && editingContact) {
      const updatedPhones = [
        ...(editingContact.phones || []),
        {
          id: `temp-${Date.now()}`,
          number: phoneNumber,
          type: phoneType,
          isPreferred: false,
        },
      ];
      handleEditingContactChange("phones", updatedPhones);
      // Clear the input value and remove the type from open list
      const newValues = { ...phoneInputValues };
      delete newValues[phoneType];
      setPhoneInputValues(newValues);
      const newOpenTypes = new Set(openPhoneTypes);
      newOpenTypes.delete(phoneType);
      setOpenPhoneTypes(newOpenTypes);
    }
  };

  const handleAddCompany = (formId: string) => {
    const formValues = companyFormValues[formId];
    const formType = companyFormTypes[formId];

    if (formType === "title" && formValues?.title?.trim()) {
      const currentCompany = editingContact?.company;
      const newCompany =
        typeof currentCompany === "string"
          ? { name: currentCompany, title: formValues.title, id: "" }
          : {
              ...(currentCompany || { name: "", id: "" }),
              title: formValues.title,
            };
      handleEditingContactChange("company", newCompany);
      const newValues = { ...companyFormValues };
      delete newValues[formId];
      setCompanyFormValues(newValues);
      const newTypes = { ...companyFormTypes };
      delete newTypes[formId];
      setCompanyFormTypes(newTypes);
      const newFormIds = new Set(openCompanyFormIds);
      newFormIds.delete(formId);
      setOpenCompanyFormIds(newFormIds);
    } else if (formType === "department" && formValues?.department?.trim()) {
      // Salva il dipartimento
      const currentCompany = editingContact?.company;
      const newCompany =
        typeof currentCompany === "string"
          ? { name: currentCompany, department: formValues.department, id: "" }
          : {
              ...(currentCompany || { name: "", id: "" }),
              department: formValues.department,
            };
      handleEditingContactChange("company", newCompany);

      const newValues = { ...companyFormValues };
      delete newValues[formId];
      setCompanyFormValues(newValues);
      const newTypes = { ...companyFormTypes };
      delete newTypes[formId];
      setCompanyFormTypes(newTypes);
      const newFormIds = new Set(openCompanyFormIds);
      newFormIds.delete(formId);
      setOpenCompanyFormIds(newFormIds);
    } else if (formType === "office" && formValues?.office?.trim()) {
      // Salva l'office location
      const newValues = { ...companyFormValues };
      delete newValues[formId];
      setCompanyFormValues(newValues);
      const newTypes = { ...companyFormTypes };
      delete newTypes[formId];
      setCompanyFormTypes(newTypes);
      const newFormIds = new Set(openCompanyFormIds);
      newFormIds.delete(formId);
      setOpenCompanyFormIds(newFormIds);
    }
  };

  const handleAddTaxIdentifier = (formId: string) => {
    const formValues = taxIdentifierInputValues[formId]?.trim();
    const formType = taxIdentifierFormTypes[formId];

    if (formValues && editingContact && formType) {
      const updatedTaxIdentifiers = [
        ...(editingContact.taxIdentifiers || []),
        {
          id: `temp-${Date.now()}`,
          value: formValues,
          type: formType,
        },
      ];
      handleEditingContactChange("taxIdentifiers", updatedTaxIdentifiers);
      // Remove this form
      const newFormIds = new Set(openTaxIdentifierFormIds);
      newFormIds.delete(formId);
      setOpenTaxIdentifierFormIds(newFormIds);
      // Clear input
      const newValues = { ...taxIdentifierInputValues };
      delete newValues[formId];
      setTaxIdentifierInputValues(newValues);
      const newTypes = { ...taxIdentifierFormTypes };
      delete newTypes[formId];
      setTaxIdentifierFormTypes(newTypes);
    }
  };

  const handleAddCompanyTaxIdentifier = (formId: string) => {
    const formValues = companyTaxIdentifierInputValues[formId]?.trim();
    const formType = companyTaxIdentifierFormTypes[formId];

    if (formValues && editingContact && formType) {
      const currentCompany = editingContact.company;
      const companyObj =
        typeof currentCompany === "object" && currentCompany !== null
          ? currentCompany
          : {
              name: typeof currentCompany === "string" ? currentCompany : "",
              id: "",
            };

      const updatedTaxIdentifiers = [
        ...(companyObj.taxIdentifiers || []),
        {
          id: `temp-${Date.now()}`,
          value: formValues,
          type: formType,
        },
      ];

      handleEditingContactChange("company", {
        ...companyObj,
        taxIdentifiers: updatedTaxIdentifiers,
      });

      // Remove this form
      const newFormIds = new Set(openCompanyTaxIdentifierFormIds);
      newFormIds.delete(formId);
      setOpenCompanyTaxIdentifierFormIds(newFormIds);
      // Clear input
      const newValues = { ...companyTaxIdentifierInputValues };
      delete newValues[formId];
      setCompanyTaxIdentifierInputValues(newValues);
    }
  };

  const handleAddEmail = (formId: string) => {
    const email = emailInputValues[formId]?.trim();
    if (email && editingContact) {
      const updatedEmails = [
        ...(editingContact.emails || []),
        {
          id: `temp-${Date.now()}`,
          email: email,
          isPreferred: false,
        },
      ];
      handleEditingContactChange("emails", updatedEmails);
      // Remove this form
      const newFormIds = new Set(openEmailFormIds);
      newFormIds.delete(formId);
      setOpenEmailFormIds(newFormIds);
      // Clear input
      const newValues = { ...emailInputValues };
      delete newValues[formId];
      setEmailInputValues(newValues);
    }
  };

  const handleAddChat = (formId: string) => {
    const chatValue = chatInputValues[formId]?.trim();
    if (chatValue && editingContact) {
      const updatedChats = [
        ...(editingContact.chats || []),
        {
          id: `temp-${Date.now()}`,
          label: "chat",
          value: chatValue,
        },
      ];
      handleEditingContactChange("chats", updatedChats);
      // Remove this form
      const newFormIds = new Set(openChatFormIds);
      newFormIds.delete(formId);
      setOpenChatFormIds(newFormIds);
      // Clear input
      const newValues = { ...chatInputValues };
      delete newValues[formId];
      setChatInputValues(newValues);
    }
  };

  const handleAddAddress = (formId: string) => {
    const formValues = addressFormValues[formId];
    const formType = addressFormTypes[formId] || "HOME";
    if (
      formValues?.street?.trim() &&
      formValues?.city?.trim() &&
      formValues?.postalCode?.trim() &&
      formValues?.country?.trim() &&
      editingContact
    ) {
      const updatedAddresses = [
        ...(editingContact.addresses || []),
        {
          id: `temp-${Date.now()}`,
          street: formValues.street,
          street2: formValues.street2 || undefined,
          city: formValues.city,
          state: formValues.state || undefined,
          postalCode: formValues.postalCode,
          country: formValues.country,
          type: formType,
        },
      ];
      handleEditingContactChange("addresses", updatedAddresses);
      // Remove this form
      const newFormIds = new Set(openAddressFormIds);
      newFormIds.delete(formId);
      setOpenAddressFormIds(newFormIds);
      // Clear form values
      const newValues = { ...addressFormValues };
      delete newValues[formId];
      setAddressFormValues(newValues);
      const newTypes = { ...addressFormTypes };
      delete newTypes[formId];
      setAddressFormTypes(newTypes);
    }
  };

  const handleEditingContactChange = (field: string, value: any) => {
    if (editingContact) {
      setEditingContact({
        ...editingContact,
        [field]: value,
      });
    }
  };

  function setBirthday(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  function setAnniversary(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

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

      <Toolbar className={styles.toolbar}>
        <Menu positioning="below-end">
          <MenuTrigger disableButtonEnhancement>
            {(triggerProps: MenuButtonProps) => (
              <SplitButton
                appearance="primary"
                menuButton={{
                  ...triggerProps,
                  onClick: (e: any) => {
                    e.stopPropagation();
                    triggerProps.onClick?.(e);
                  },
                }}
                icon={<Add24Regular />}
                onClick={handleCreateNewContact}
              >
                Nuovo Contatto
              </SplitButton>
            )}
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              <MenuItem
                icon={<Person24Regular />}
                onClick={handleCreateNewContact}
              >
                Contatto
              </MenuItem>
              <MenuItem icon={<People24Regular />}>
                Gruppo / Lista contatti
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
        <ToolbarButton icon={<Edit24Regular />} disabled={!editingContact}>
          Modifica
        </ToolbarButton>
        <ToolbarButton
          icon={<Delete24Regular />}
          disabled={!editingContact || !editingContact.id}
          onClick={handleDeleteContact}
        >
          Elimina
        </ToolbarButton>
        <ToolbarDivider />

        <Menu positioning="below-end">
          <MenuTrigger disableButtonEnhancement>
            {(triggerProps: MenuButtonProps) => (
              <SplitButton menuButton={triggerProps}>
                Gestione contatti
              </SplitButton>
            )}
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              <MenuItem
                icon={<ArrowImport24Regular />}
                onClick={() => {
                  console.log("Opening import dialog");
                  setImportDialogOpen(true);
                }}
              >
                Importa contatti
              </MenuItem>
              <MenuItem icon={<ArrowExport24Regular />}>
                Esporta contatti
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </Toolbar>

      <ImportContactsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      <div className={styles.mainContainer}>
        <div className={styles.listPanel}>
          <div style={{ padding: "10px", fontWeight: "bold" }}>
            Contatti ({total})
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
          {loading && contacts.length === 0 && (
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
          {!loading && contacts.length === 0 && !error && (
            <div
              style={{
                padding: "1rem",
                color: "#999",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              Nessun contatto trovato
            </div>
          )}
          <div className={styles.navDrawerContent}>
            {contacts.map((contact) => {
              if (!contact.id) {
                throw new Error("Contact ID is missing");
              }
              const contactId = contact.id;
              const imageUrl = contact.photoUrl || avatarBlobUrls[contactId];
              const isDeleted = contact.deletedAt !== null;
              return (
                <div key={contactId} style={{ position: "relative" }}>
                  <button
                    onClick={() => handleSelectContact(contact)}
                    className={`${styles.navDrawerItem} ${
                      editingContact?.id === contactId ? styles.selected : ""
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
                            <span>{contact.company.name}</span>
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
                  {isDeleted && (
                    <Button
                      size="small"
                      appearance="danger"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        zIndex: 2,
                      }}
                      onClick={() => handlePermanentDeleteContact(contactId)}
                    >
                      Elimina definitivamente
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div ref={observerTarget} style={{ height: "20px" }} />
        </div>

        <div className={styles.detailPanel}>
          {editDialogOpen && editingContact ? (
            <div className={styles.editPanel}>
              <div className={styles.editPanelContent}>
                <div className={styles.editPhotoSection}>
                  <div className={styles.editPhoto}>
                    {!editingContact.id ? (
                      <Avatar
                        icon={<Person48Regular />}
                        size={96}
                        shape="circular"
                      />
                    ) : editingContact.photoUrl || avatarBlobUrl ? (
                      <Avatar
                        name={
                          editingContact.fullName ||
                          `${editingContact.firstName || ""} ${editingContact.lastName || ""}`.trim()
                        }
                        image={{
                          src: editingContact.photoUrl || avatarBlobUrl || "",
                        }}
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
                  </div>
                  <div className={styles.editFormSmall}>
                    {(visibleNameFields.has("company.title") ||
                      editingContact.prefix) && (
                      <div className={styles.formGroup}>
                        <label>Ruolo aziendale:</label>
                        <Input
                          value={editingContact.company?.title || ""}
                          onChange={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            const currentCompany = editingContact.company;
                            const newCompany =
                              typeof currentCompany === "string"
                                ? { name: currentCompany, title: val, id: "" }
                                : {
                                    ...(currentCompany || {
                                      name: "",
                                      id: "",
                                    }),
                                    title: val,
                                  };
                            handleEditingContactChange("company", newCompany);
                          }}
                        />
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>Name</label>
                      <Input
                        value={editingContact.firstName || ""}
                        onChange={(e) =>
                          handleEditingContactChange(
                            "firstName",
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </div>

                    {(visibleNameFields.has("middleName") ||
                      editingContact.middleName) && (
                      <div className={styles.formGroup}>
                        <label>Secondo nome</label>
                        <Input
                          value={editingContact.middleName || ""}
                          onChange={(e) =>
                            handleEditingContactChange(
                              "middleName",
                              (e.target as HTMLInputElement).value
                            )
                          }
                        />
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>Cognome</label>
                      <Input
                        value={editingContact.lastName || ""}
                        onChange={(e) =>
                          handleEditingContactChange(
                            "lastName",
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </div>

                    {(visibleNameFields.has("suffix") ||
                      editingContact.suffix) && (
                      <div className={styles.formGroup}>
                        <label>Suffisso</label>
                        <Input
                          value={editingContact.suffix || ""}
                          onChange={(e) =>
                            handleEditingContactChange(
                              "suffix",
                              (e.target as HTMLInputElement).value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.editForm}>
                  {visibleNameFields.has("nickname") && (
                    <div className={styles.formGroup}>
                      <label>Nickname</label>
                      <Input
                        value={editingContact.nickname || ""}
                        onChange={(e) =>
                          handleEditingContactChange(
                            "nickname",
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </div>
                  )}

                  {visibleNameFields.has("phoneticFirstName") && (
                    <div className={styles.formGroup}>
                      <label>Nome fonetico</label>
                      <Input
                        value={editingContact.phoneticFirstName || ""}
                        onChange={(e) =>
                          handleEditingContactChange(
                            "phoneticFirstName",
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </div>
                  )}

                  {visibleNameFields.has("phoneticLastName") && (
                    <div className={styles.formGroup}>
                      <label>Cognome fonetico</label>
                      <Input
                        value={editingContact.phoneticLastName || ""}
                        onChange={(e) =>
                          handleEditingContactChange(
                            "phoneticLastName",
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </div>
                  )}

                  <Menu positioning="below-start">
                    <MenuTrigger disableButtonEnhancement>
                      <a
                        href="#"
                        className={styles.addNameField}
                        onClick={(e) => e.preventDefault()}
                      >
                        + Aggiungi campo nome
                      </a>
                    </MenuTrigger>

                    <MenuPopover>
                      <MenuList>
                        {!visibleNameFields.has("prefix") && (
                          <MenuItem
                            onClick={() => handleAddNameField("prefix")}
                          >
                            Titolo onorifico
                          </MenuItem>
                        )}
                        {!visibleNameFields.has("middleName") && (
                          <MenuItem
                            onClick={() => handleAddNameField("middleName")}
                          >
                            Secondo nome
                          </MenuItem>
                        )}
                        {!visibleNameFields.has("suffix") && (
                          <MenuItem
                            onClick={() => handleAddNameField("suffix")}
                          >
                            Suffisso
                          </MenuItem>
                        )}
                        {!visibleNameFields.has("nickname") && (
                          <MenuItem
                            onClick={() => handleAddNameField("nickname")}
                          >
                            Nickname
                          </MenuItem>
                        )}
                        {!visibleNameFields.has("phoneticFirstName") && (
                          <MenuItem
                            onClick={() =>
                              handleAddNameField("phoneticFirstName")
                            }
                          >
                            Nome fonetico
                          </MenuItem>
                        )}
                        {!visibleNameFields.has("phoneticLastName") && (
                          <MenuItem
                            onClick={() =>
                              handleAddNameField("phoneticLastName")
                            }
                          >
                            Cognome fonetico
                          </MenuItem>
                        )}
                      </MenuList>
                    </MenuPopover>
                  </Menu>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                    }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      {editingContact.taxIdentifiers &&
                        editingContact.taxIdentifiers.length > 0 && (
                          <div style={{ marginBottom: "16px" }}>
                            {editingContact.taxIdentifiers.map((taxId) => (
                              <div
                                key={`readonly-taxid-${taxId.id}`}
                                className={styles.formGroup}
                              >
                                <label>
                                  {taxId.type === ("CF" as TaxIdentifierType) &&
                                    "Codice fiscale"}
                                  {taxId.type ===
                                    ("PIVA" as TaxIdentifierType) &&
                                    "Partita IVA"}
                                </label>
                                <Input readOnly value={taxId.value || ""} />
                              </div>
                            ))}
                          </div>
                        )}
                      {(!editingContact.taxIdentifiers ||
                        editingContact.taxIdentifiers.length === 0) && (
                        <div style={{ marginBottom: "16px" }}></div>
                      )}
                      {Array.from(openTaxIdentifierFormIds).map((formId) => {
                        const formType = taxIdentifierFormTypes[formId];
                        const isCodiceFiscale = formType === "codiceFiscale";
                        const isPartitaIVA = formType === "partitaIVA";

                        return (
                          <div
                            key={`taxid-input-${formId}`}
                            style={{ marginTop: "12px", marginBottom: "12px" }}
                            className={styles.formGroup}
                          >
                            <label>
                              {isCodiceFiscale && "Codice fiscale"}
                              {isPartitaIVA && "Partita IVA"}
                            </label>
                            <Input
                              value={taxIdentifierInputValues[formId] || ""}
                              onChange={(e) =>
                                setTaxIdentifierInputValues({
                                  ...taxIdentifierInputValues,
                                  [formId]: (e.target as HTMLInputElement)
                                    .value,
                                })
                              }
                              placeholder=""
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleAddTaxIdentifier(formId);
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                      <Menu positioning="below-start">
                        <MenuTrigger disableButtonEnhancement>
                          <a
                            href="#"
                            className={styles.addNameField}
                            onClick={(e) => e.preventDefault()}
                          >
                            + Aggiungi identificativo fiscale
                          </a>
                        </MenuTrigger>

                        <MenuPopover>
                          <MenuList>
                            {!Object.values(taxIdentifierFormTypes).includes(
                              "codiceFiscale"
                            ) && (
                              <MenuItem
                                onClick={() => {
                                  const newFormId = `taxid-${Date.now()}`;
                                  setOpenTaxIdentifierFormIds(
                                    new Set([
                                      ...openTaxIdentifierFormIds,
                                      newFormId,
                                    ])
                                  );
                                  setTaxIdentifierInputValues({
                                    ...taxIdentifierInputValues,
                                    [newFormId]: "",
                                  });
                                  setTaxIdentifierFormTypes({
                                    ...taxIdentifierFormTypes,
                                    [newFormId]: "codiceFiscale",
                                  });
                                }}
                              >
                                Codice fiscale
                              </MenuItem>
                            )}
                            {!Object.values(taxIdentifierFormTypes).includes(
                              "partitaIVA"
                            ) && (
                              <MenuItem
                                onClick={() => {
                                  const newFormId = `taxid-${Date.now()}`;
                                  setOpenTaxIdentifierFormIds(
                                    new Set([
                                      ...openTaxIdentifierFormIds,
                                      newFormId,
                                    ])
                                  );
                                  setTaxIdentifierInputValues({
                                    ...taxIdentifierInputValues,
                                    [newFormId]: "",
                                  });
                                  setTaxIdentifierFormTypes({
                                    ...taxIdentifierFormTypes,
                                    [newFormId]: "partitaIVA",
                                  });
                                }}
                              >
                                Partita IVA
                              </MenuItem>
                            )}
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                    }}
                  >
                    {editingContact.chats &&
                      editingContact.chats.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                          {editingContact.chats.map((chat) => (
                            <div
                              key={`readonly-chat-${chat.id}`}
                              className={styles.formGroup}
                            >
                              <label>Indirizzo chat</label>
                              <Input readOnly value={chat.value || ""} />
                            </div>
                          ))}
                        </div>
                      )}
                    {Array.from(openChatFormIds).map((formId) => (
                      <div
                        key={`chat-input-${formId}`}
                        style={{ marginTop: "12px", marginBottom: "12px" }}
                        className={styles.formGroup}
                      >
                        <label>Indirizzo chat</label>
                        <Input
                          value={chatInputValues[formId] || ""}
                          onChange={(e) =>
                            setChatInputValues({
                              ...chatInputValues,
                              [formId]: (e.target as HTMLInputElement).value,
                            })
                          }
                          placeholder=""
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddChat(formId);
                            }
                          }}
                        />
                      </div>
                    ))}
                    <a
                      href="#"
                      className={styles.addNameField}
                      onClick={(e) => {
                        e.preventDefault();
                        const newFormId = `chat-${Date.now()}`;
                        setOpenChatFormIds(
                          new Set([...openChatFormIds, newFormId])
                        );
                        setChatInputValues({
                          ...chatInputValues,
                          [newFormId]: "",
                        });
                      }}
                    >
                      + Aggiungi chat
                    </a>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                    }}
                  >
                    <div className={styles.formGroup}>
                      <label>Indirizzo email</label>
                      <Input readOnly value={editingContact.preferredEmail} />
                    </div>
                    {Array.from(openEmailFormIds).map((formId) => (
                      <div
                        key={`email-input-${formId}`}
                        style={{ marginTop: "12px", marginBottom: "12px" }}
                        className={styles.formGroup}
                      >
                        <label>Indirizzo email</label>
                        <Input
                          value={emailInputValues[formId] || ""}
                          onChange={(e) =>
                            setEmailInputValues({
                              ...emailInputValues,
                              [formId]: (e.target as HTMLInputElement).value,
                            })
                          }
                          placeholder=""
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddEmail(formId);
                            }
                          }}
                        />
                      </div>
                    ))}
                    <a
                      href="#"
                      className={styles.addNameField}
                      onClick={(e) => {
                        e.preventDefault();
                        const newFormId = `email-${Date.now()}`;
                        setOpenEmailFormIds(
                          new Set([...openEmailFormIds, newFormId])
                        );
                        setEmailInputValues({
                          ...emailInputValues,
                          [newFormId]: "",
                        });
                      }}
                    >
                      + Aggiungi indirizzo email
                    </a>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                    }}
                  >
                    {editingContact.phones &&
                      editingContact.phones.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                          {editingContact.phones.map((phone) => (
                            <div
                              key={`readonly-phone-${phone.id}`}
                              className={styles.formGroup}
                            >
                              <label>Numero telefonico mobile</label>
                              <Input readOnly value={phone.number || ""} />
                            </div>
                          ))}
                        </div>
                      )}
                    {(!editingContact.phones ||
                      editingContact.phones.length === 0) && (
                      <div className={styles.formGroup}>
                        <label>Numero di telefono mobile</label>
                        <Input readOnly value="" placeholder="" />
                      </div>
                    )}
                    {Array.from(openPhoneTypes).map((phoneType) => (
                      <div
                        key={`phone-input-${phoneType}`}
                        style={{ marginTop: "12px", marginBottom: "12px" }}
                        className={styles.formGroup}
                      >
                        <label>Nuovo telefono {phoneType.toLowerCase()}</label>
                        <Input
                          value={phoneInputValues[phoneType] || ""}
                          onChange={(e) =>
                            setPhoneInputValues({
                              ...phoneInputValues,
                              [phoneType]: (e.target as HTMLInputElement).value,
                            })
                          }
                          placeholder=""
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddPhone(phoneType);
                            }
                          }}
                        />
                      </div>
                    ))}
                    <Menu positioning="below-start">
                      <MenuTrigger disableButtonEnhancement>
                        <a
                          href="#"
                          className={styles.addNameField}
                          onClick={(e) => e.preventDefault()}
                        >
                          + Aggiungi numero di telefono
                        </a>
                      </MenuTrigger>

                      <MenuPopover>
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              setOpenPhoneTypes(
                                new Set([...openPhoneTypes, "MOBILE"])
                              );
                            }}
                          >
                            Mobile
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setOpenPhoneTypes(
                                new Set([...openPhoneTypes, "HOME"])
                              );
                            }}
                          >
                            Home
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setOpenPhoneTypes(
                                new Set([...openPhoneTypes, "BUSINESS"])
                              );
                            }}
                          >
                            Business
                          </MenuItem>
                          <Menu>
                            <MenuTrigger disableButtonEnhancement>
                              <MenuItem>Altro</MenuItem>
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([
                                        ...openPhoneTypes,
                                        "ORGANIZATION_MAIN",
                                      ])
                                    );
                                  }}
                                >
                                  Organization main
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "PAGER"])
                                    );
                                  }}
                                >
                                  Pager
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "OTHER"])
                                    );
                                  }}
                                >
                                  Other
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "TTY"])
                                    );
                                  }}
                                >
                                  TTY
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "TELEX"])
                                    );
                                  }}
                                >
                                  Telex
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "HOME_FAX"])
                                    );
                                  }}
                                >
                                  Home fax
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([
                                        ...openPhoneTypes,
                                        "BUSINESS_FAX",
                                      ])
                                    );
                                  }}
                                >
                                  Business fax
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "OTHER_FAX"])
                                    );
                                  }}
                                >
                                  Other fax
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([
                                        ...openPhoneTypes,
                                        "ASSISTANT_PHONE",
                                      ])
                                    );
                                  }}
                                >
                                  Assistant phone
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([
                                        ...openPhoneTypes,
                                        "CALLBACK_PHONE",
                                      ])
                                    );
                                  }}
                                >
                                  Callback phone
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([
                                        ...openPhoneTypes,
                                        "RADIO_PHONE",
                                      ])
                                    );
                                  }}
                                >
                                  Radio phone
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "TELTEX"])
                                    );
                                  }}
                                >
                                  Teltex
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setOpenPhoneTypes(
                                      new Set([...openPhoneTypes, "TTY"])
                                    );
                                  }}
                                >
                                  TTY
                                </MenuItem>
                              </MenuList>
                            </MenuPopover>
                          </Menu>
                        </MenuList>
                      </MenuPopover>
                    </Menu>

                    {/* Company Tax Identifiers Section */}
                    <div style={{ marginTop: "16px" }}>
                      {typeof editingContact.company === "object" &&
                        editingContact.company?.taxIdentifiers &&
                        editingContact.company.taxIdentifiers.length > 0 && (
                          <div style={{ marginBottom: "16px" }}>
                            {editingContact.company.taxIdentifiers.map(
                              (taxId) => (
                                <div
                                  key={`readonly-company-taxid-${taxId.id}`}
                                  className={styles.formGroup}
                                >
                                  <label>
                                    {taxId.type ===
                                      ("CF" as TaxIdentifierType) &&
                                      "Codice fiscale Azienda"}
                                    {taxId.type ===
                                      ("PIVA" as TaxIdentifierType) &&
                                      "Partita IVA Azienda"}
                                  </label>
                                  <Input readOnly value={taxId.value || ""} />
                                </div>
                              )
                            )}
                          </div>
                        )}

                      {Array.from(openCompanyTaxIdentifierFormIds).map(
                        (formId) => {
                          const formType =
                            companyTaxIdentifierFormTypes[formId];
                          const isCodiceFiscale = formType === "codiceFiscale";
                          const isPartitaIVA = formType === "partitaIVA";

                          return (
                            <div
                              key={`company-taxid-input-${formId}`}
                              style={{
                                marginTop: "12px",
                                marginBottom: "12px",
                              }}
                              className={styles.formGroup}
                            >
                              <label>
                                {isCodiceFiscale && "Codice fiscale Azienda"}
                                {isPartitaIVA && "Partita IVA Azienda"}
                              </label>
                              <Input
                                value={
                                  companyTaxIdentifierInputValues[formId] || ""
                                }
                                onChange={(e) =>
                                  setCompanyTaxIdentifierInputValues({
                                    ...companyTaxIdentifierInputValues,
                                    [formId]: (e.target as HTMLInputElement)
                                      .value,
                                  })
                                }
                                placeholder=""
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddCompanyTaxIdentifier(formId);
                                  }
                                }}
                              />
                            </div>
                          );
                        }
                      )}

                      <Menu positioning="below-start">
                        <MenuTrigger disableButtonEnhancement>
                          <a
                            href="#"
                            className={styles.addNameField}
                            onClick={(e) => e.preventDefault()}
                          >
                            + Aggiungi identificativo fiscale azienda
                          </a>
                        </MenuTrigger>

                        <MenuPopover>
                          <MenuList>
                            <MenuItem
                              onClick={() => {
                                const newFormId = `company-taxid-${Date.now()}`;
                                setOpenCompanyTaxIdentifierFormIds(
                                  new Set([
                                    ...openCompanyTaxIdentifierFormIds,
                                    newFormId,
                                  ])
                                );
                                setCompanyTaxIdentifierInputValues({
                                  ...companyTaxIdentifierInputValues,
                                  [newFormId]: "",
                                });
                                setCompanyTaxIdentifierFormTypes({
                                  ...companyTaxIdentifierFormTypes,
                                  [newFormId]: "partitaIVA",
                                });
                              }}
                            >
                              Partita IVA
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                const newFormId = `company-taxid-${Date.now()}`;
                                setOpenCompanyTaxIdentifierFormIds(
                                  new Set([
                                    ...openCompanyTaxIdentifierFormIds,
                                    newFormId,
                                  ])
                                );
                                setCompanyTaxIdentifierInputValues({
                                  ...companyTaxIdentifierInputValues,
                                  [newFormId]: "",
                                });
                                setCompanyTaxIdentifierFormTypes({
                                  ...companyTaxIdentifierFormTypes,
                                  [newFormId]: "codiceFiscale",
                                });
                              }}
                            >
                              Codice Fiscale
                            </MenuItem>
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    {Array.from(openAddressFormIds).map((formId) => (
                      <div key={`address-form-${formId}`}>
                        <div className={styles.formGroup}>
                          <label>Tipo</label>
                          <Dropdown
                            value={addressFormTypes[formId] || "HOME"}
                            onOptionSelect={(_, data) => {
                              setAddressFormTypes({
                                ...addressFormTypes,
                                [formId]: data.optionValue || "HOME",
                              });
                            }}
                          >
                            <Option value="HOME">Casa</Option>
                            <Option value="BUSINESS">Lavoro</Option>
                            <Option value="OTHER">Altro</Option>
                          </Dropdown>
                        </div>
                        <div className={styles.formGroup}>
                          <label>Via/Indirizzo</label>
                          <Input
                            value={addressFormValues[formId]?.street || ""}
                            onChange={(e) =>
                              setAddressFormValues({
                                ...addressFormValues,
                                [formId]: {
                                  ...addressFormValues[formId],
                                  street: (e.target as HTMLInputElement).value,
                                },
                              })
                            }
                            placeholder="Via e numero civico"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleAddAddress(formId);
                              }
                            }}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Via 2 (supplementare)</label>
                          <Input
                            value={addressFormValues[formId]?.street2 || ""}
                            onChange={(e) =>
                              setAddressFormValues({
                                ...addressFormValues,
                                [formId]: {
                                  ...addressFormValues[formId],
                                  street2: (e.target as HTMLInputElement).value,
                                },
                              })
                            }
                            placeholder="Informazioni aggiuntive indirizzo"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Città</label>
                          <Input
                            value={addressFormValues[formId]?.city || ""}
                            onChange={(e) =>
                              setAddressFormValues({
                                ...addressFormValues,
                                [formId]: {
                                  ...addressFormValues[formId],
                                  city: (e.target as HTMLInputElement).value,
                                },
                              })
                            }
                            placeholder="Città"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Provincia/Stato</label>
                          <Input
                            value={addressFormValues[formId]?.state || ""}
                            onChange={(e) =>
                              setAddressFormValues({
                                ...addressFormValues,
                                [formId]: {
                                  ...addressFormValues[formId],
                                  state: (e.target as HTMLInputElement).value,
                                },
                              })
                            }
                            placeholder="Provincia o stato"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>CAP</label>
                          <Input
                            value={addressFormValues[formId]?.postalCode || ""}
                            onChange={(e) =>
                              setAddressFormValues({
                                ...addressFormValues,
                                [formId]: {
                                  ...addressFormValues[formId],
                                  postalCode: (e.target as HTMLInputElement)
                                    .value,
                                },
                              })
                            }
                            placeholder="Codice postale"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Paese</label>
                          <Input
                            value={addressFormValues[formId]?.country || ""}
                            onChange={(e) =>
                              setAddressFormValues({
                                ...addressFormValues,
                                [formId]: {
                                  ...addressFormValues[formId],
                                  country: (e.target as HTMLInputElement).value,
                                },
                              })
                            }
                            placeholder="Paese"
                          />
                        </div>
                      </div>
                    ))}
                    <Menu positioning="below-start">
                      <MenuTrigger disableButtonEnhancement>
                        <a
                          href="#"
                          className={styles.addNameField}
                          onClick={(e) => e.preventDefault()}
                        >
                          + Aggiungi indirizzo
                        </a>
                      </MenuTrigger>

                      <MenuPopover>
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              const newFormId = `address-${Date.now()}`;
                              setOpenAddressFormIds(
                                new Set([...openAddressFormIds, newFormId])
                              );
                              setAddressFormValues({
                                ...addressFormValues,
                                [newFormId]: {
                                  street: "",
                                  street2: "",
                                  city: "",
                                  state: "",
                                  postalCode: "",
                                  country: "",
                                },
                              });
                              setAddressFormTypes({
                                ...addressFormTypes,
                                [newFormId]: "HOME",
                              });
                            }}
                          >
                            Casa
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              const newFormId = `address-${Date.now()}`;
                              setOpenAddressFormIds(
                                new Set([...openAddressFormIds, newFormId])
                              );
                              setAddressFormValues({
                                ...addressFormValues,
                                [newFormId]: {
                                  street: "",
                                  street2: "",
                                  city: "",
                                  state: "",
                                  postalCode: "",
                                  country: "",
                                },
                              });
                              setAddressFormTypes({
                                ...addressFormTypes,
                                [newFormId]: "BUSINESS",
                              });
                            }}
                          >
                            Lavoro
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              const newFormId = `address-${Date.now()}`;
                              setOpenAddressFormIds(
                                new Set([...openAddressFormIds, newFormId])
                              );
                              setAddressFormValues({
                                ...addressFormValues,
                                [newFormId]: {
                                  street: "",
                                  street2: "",
                                  city: "",
                                  state: "",
                                  postalCode: "",
                                  country: "",
                                },
                              });
                              setAddressFormTypes({
                                ...addressFormTypes,
                                [newFormId]: "OTHER",
                              });
                            }}
                          >
                            Altro
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        className={styles.formGroup}
                        style={{ flex: "1 1 0" }}
                      >
                        <label>Azienda</label>
                        <Input
                          value={
                            typeof editingContact.company === "string"
                              ? editingContact.company
                              : editingContact.company?.name || ""
                          }
                          onChange={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            if (
                              typeof editingContact.company === "object" &&
                              editingContact.company !== null
                            ) {
                              handleEditingContactChange("company", {
                                ...editingContact.company,
                                name: val,
                              });
                            } else {
                              handleEditingContactChange("company", val);
                            }
                          }}
                          placeholder="Nome azienda"
                        />
                      </div>
                      {editingContact.company?.title !== undefined && (
                        <div
                          className={styles.formGroup}
                          style={{ flex: "1 1 0" }}
                        >
                          <label>Ruolo aziendale</label>
                          <Input
                            value={editingContact.company?.title || ""}
                            onChange={(e) => {
                              const val = (e.target as HTMLInputElement).value;
                              const currentCompany = editingContact.company;
                              const newCompany =
                                typeof currentCompany === "string"
                                  ? { name: currentCompany, title: val, id: "" }
                                  : {
                                      ...(currentCompany || {
                                        name: "",
                                        id: "",
                                      }),
                                      title: val,
                                    };
                              handleEditingContactChange("company", newCompany);
                            }}
                            placeholder="Titolo"
                          />
                        </div>
                      )}
                    </div>
                    {Array.from(openCompanyFormIds).length > 0 && (
                      <>
                        {(() => {
                          const formIds = Array.from(openCompanyFormIds);
                          const rows = [];
                          for (let i = 0; i < formIds.length; i += 2) {
                            rows.push(formIds.slice(i, i + 2));
                          }
                          return rows.map((rowFormIds, rowIndex) => (
                            <div
                              key={`company-row-${rowIndex}`}
                              style={{
                                display: "flex",
                                gap: "16px",
                                marginBottom: "12px",
                              }}
                            >
                              {rowFormIds.map((formId) => {
                                const formType = companyFormTypes[formId];
                                const isTitle = formType === "title";
                                const isDepartment = formType === "department";
                                const isOffice = formType === "office";
                                const isPronounciation =
                                  formType === "pronunciation";

                                return (
                                  <div
                                    key={`company-form-${formId}`}
                                    className={styles.formGroup}
                                    style={{ flex: "1 1 0" }}
                                  >
                                    {isTitle && (
                                      <>
                                        <label>Ruolo aziendale</label>
                                        <Input
                                          value={
                                            companyFormValues[formId]?.title ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            setCompanyFormValues({
                                              ...companyFormValues,
                                              [formId]: {
                                                ...companyFormValues[formId],
                                                title: (
                                                  e.target as HTMLInputElement
                                                ).value,
                                              },
                                            })
                                          }
                                          placeholder="Titolo"
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              handleAddCompany(formId);
                                            }
                                          }}
                                        />
                                      </>
                                    )}
                                    {isDepartment && (
                                      <>
                                        <label>Dipartimento</label>
                                        <Input
                                          value={
                                            companyFormValues[formId]
                                              ?.department || ""
                                          }
                                          onChange={(e) =>
                                            setCompanyFormValues({
                                              ...companyFormValues,
                                              [formId]: {
                                                ...companyFormValues[formId],
                                                department: (
                                                  e.target as HTMLInputElement
                                                ).value,
                                              },
                                            })
                                          }
                                          placeholder="Nome dipartimento"
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              handleAddCompany(formId);
                                            }
                                          }}
                                        />
                                      </>
                                    )}
                                    {isOffice && (
                                      <>
                                        <label>Office Location</label>
                                        <Input
                                          value={
                                            companyFormValues[formId]?.office ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            setCompanyFormValues({
                                              ...companyFormValues,
                                              [formId]: {
                                                ...companyFormValues[formId],
                                                office: (
                                                  e.target as HTMLInputElement
                                                ).value,
                                              },
                                            })
                                          }
                                          placeholder="Ubicazione ufficio"
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              handleAddCompany(formId);
                                            }
                                          }}
                                        />
                                      </>
                                    )}
                                    {isPronounciation && (
                                      <>
                                        <label>
                                          Pronuncia del nome aziendale
                                        </label>
                                        <Input
                                          value={
                                            companyFormValues[formId]
                                              ?.pronunciation || ""
                                          }
                                          onChange={(e) =>
                                            setCompanyFormValues({
                                              ...companyFormValues,
                                              [formId]: {
                                                ...companyFormValues[formId],
                                                pronunciation: (
                                                  e.target as HTMLInputElement
                                                ).value,
                                              },
                                            })
                                          }
                                          placeholder="Pronuncia"
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              handleAddCompany(formId);
                                            }
                                          }}
                                        />
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ));
                        })()}
                      </>
                    )}
                    <Menu positioning="below-start">
                      <MenuTrigger disableButtonEnhancement>
                        <a
                          href="#"
                          className={styles.addNameField}
                          onClick={(e) => e.preventDefault()}
                        >
                          + Aggiungi informazione aziendale
                        </a>
                      </MenuTrigger>

                      <MenuPopover>
                        <MenuList>
                          {editingContact.company?.title === undefined && (
                            <MenuItem
                              onClick={() => {
                                const newFormId = `company-${Date.now()}`;
                                setOpenCompanyFormIds(
                                  new Set([...openCompanyFormIds, newFormId])
                                );
                                setCompanyFormValues({
                                  ...companyFormValues,
                                  [newFormId]: {
                                    title: "",
                                  },
                                });
                                setCompanyFormTypes({
                                  ...companyFormTypes,
                                  [newFormId]: "title",
                                });
                              }}
                            >
                              Ruolo aziendale
                            </MenuItem>
                          )}
                          {!Object.values(companyFormTypes).includes(
                            "department"
                          ) && (
                            <MenuItem
                              onClick={() => {
                                const newFormId = `company-${Date.now()}`;
                                setOpenCompanyFormIds(
                                  new Set([...openCompanyFormIds, newFormId])
                                );
                                setCompanyFormValues({
                                  ...companyFormValues,
                                  [newFormId]: {
                                    department: "",
                                  },
                                });
                                setCompanyFormTypes({
                                  ...companyFormTypes,
                                  [newFormId]: "department",
                                });
                              }}
                            >
                              Dipartimento
                            </MenuItem>
                          )}
                          {!Object.values(companyFormTypes).includes(
                            "office"
                          ) && (
                            <MenuItem
                              onClick={() => {
                                const newFormId = `company-${Date.now()}`;
                                setOpenCompanyFormIds(
                                  new Set([...openCompanyFormIds, newFormId])
                                );
                                setCompanyFormValues({
                                  ...companyFormValues,
                                  [newFormId]: {
                                    office: "",
                                  },
                                });
                                setCompanyFormTypes({
                                  ...companyFormTypes,
                                  [newFormId]: "office",
                                });
                              }}
                            >
                              Office Location
                            </MenuItem>
                          )}
                          {!Object.values(companyFormTypes).includes(
                            "pronunciation"
                          ) && (
                            <MenuItem
                              onClick={() => {
                                const newFormId = `company-${Date.now()}`;
                                setOpenCompanyFormIds(
                                  new Set([...openCompanyFormIds, newFormId])
                                );
                                setCompanyFormValues({
                                  ...companyFormValues,
                                  [newFormId]: {
                                    pronunciation: "",
                                  },
                                });
                                setCompanyFormTypes({
                                  ...companyFormTypes,
                                  [newFormId]: "pronunciation",
                                });
                              }}
                            >
                              Pronuncia del nome aziendale
                            </MenuItem>
                          )}
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <Menu positioning="below-start">
                      <MenuTrigger disableButtonEnhancement>
                        <a
                          href="#"
                          className={styles.addNameField}
                          onClick={(e) => e.preventDefault()}
                        >
                          + Categorie
                        </a>
                      </MenuTrigger>

                      <MenuPopover>
                        <MenuList>
                          <MenuItem onClick={() => newCategory(true)}>
                            Nuova Categoria
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </div>

                  {showWebPage && (
                    <div style={{ marginTop: "16px" }}>
                      <div className={styles.formGroup}>
                        <label>Pagine web personale</label>
                        <Input
                          value={editingContact.personalWebPage || ""}
                          onChange={(e) =>
                            handleEditingContactChange(
                              "personalWebPage",
                              (e.target as HTMLInputElement).value
                            )
                          }
                          placeholder=""
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              setShowWebPage(false);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {showBirthday && (
                    <div style={{ marginTop: "16px" }}>
                      <div className={styles.formGroup}>
                        <label>Compleanno</label>
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "center",
                          }}
                        >
                          <select
                            value={editingContact.birthday?.day || ""}
                            onChange={(e) => {
                              const birthday = editingContact.birthday || {};
                              handleEditingContactChange("birthday", {
                                ...birthday,
                                day: parseInt(e.target.value),
                              });
                            }}
                            style={{
                              flex: "2 1 0",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          >
                            <option value="">Giorno</option>
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {(i + 1).toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editingContact.birthday?.month || ""}
                            onChange={(e) => {
                              const birthday = editingContact.birthday || {};
                              handleEditingContactChange("birthday", {
                                ...birthday,
                                month: parseInt(e.target.value),
                              });
                            }}
                            style={{
                              flex: "6 1 0",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          >
                            <option value="">Mese</option>
                            {[
                              "Gennaio",
                              "Febbraio",
                              "Marzo",
                              "Aprile",
                              "Maggio",
                              "Giugno",
                              "Luglio",
                              "Agosto",
                              "Settembre",
                              "Ottobre",
                              "Novembre",
                              "Dicembre",
                            ].map((month, idx) => (
                              <option key={idx + 1} value={idx + 1}>
                                {month}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editingContact.birthday?.year || ""}
                            onChange={(e) => {
                              const birthday = editingContact.birthday || {};
                              handleEditingContactChange("birthday", {
                                ...birthday,
                                year: parseInt(e.target.value),
                              });
                            }}
                            style={{
                              flex: "4 1 0",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          >
                            <option value="">Anno</option>
                            {Array.from(
                              { length: new Date().getFullYear() - 1900 + 1 },
                              (_, i) => 1900 + i
                            )
                              .reverse()
                              .map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => {
                              handleEditingContactChange("birthday", null);
                              setShowBirthday(false);
                            }}
                            style={{
                              padding: "8px",
                              backgroundColor: "#ff4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            title="Svuota il campo"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showAnniversary && (
                    <div style={{ marginTop: "16px" }}>
                      <div className={styles.formGroup}>
                        <label>Anniversario</label>
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "center",
                          }}
                        >
                          <select
                            value={editingContact.anniversary?.day || ""}
                            onChange={(e) => {
                              const anniversary =
                                editingContact.anniversary || {};
                              handleEditingContactChange("anniversary", {
                                ...anniversary,
                                day: parseInt(e.target.value),
                              });
                            }}
                            style={{
                              flex: "2 1 0",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          >
                            <option value="">Giorno</option>
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {(i + 1).toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editingContact.anniversary?.month || ""}
                            onChange={(e) => {
                              const anniversary =
                                editingContact.anniversary || {};
                              handleEditingContactChange("anniversary", {
                                ...anniversary,
                                month: parseInt(e.target.value),
                              });
                            }}
                            style={{
                              flex: "6 1 0",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          >
                            <option value="">Mese</option>
                            {[
                              "Gennaio",
                              "Febbraio",
                              "Marzo",
                              "Aprile",
                              "Maggio",
                              "Giugno",
                              "Luglio",
                              "Agosto",
                              "Settembre",
                              "Ottobre",
                              "Novembre",
                              "Dicembre",
                            ].map((month, idx) => (
                              <option key={idx + 1} value={idx + 1}>
                                {month}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editingContact.anniversary?.year || ""}
                            onChange={(e) => {
                              const anniversary =
                                editingContact.anniversary || {};
                              handleEditingContactChange("anniversary", {
                                ...anniversary,
                                year: parseInt(e.target.value),
                              });
                            }}
                            style={{
                              flex: "4 1 0",
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          >
                            <option value="">Anno</option>
                            {Array.from(
                              { length: new Date().getFullYear() - 1900 + 1 },
                              (_, i) => 1900 + i
                            )
                              .reverse()
                              .map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => {
                              handleEditingContactChange("anniversary", null);
                              setShowAnniversary(false);
                            }}
                            style={{
                              padding: "8px",
                              backgroundColor: "#ff4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            title="Svuota il campo"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showBirthPlace && (
                    <div style={{ marginTop: "16px" }}>
                      <div className={styles.formGroup}>
                        <label>Luogo di nascita</label>
                        <div style={{ display: "flex", gap: "16px" }}>
                          <Input
                            value={editingContact.birthPlace?.city || ""}
                            onChange={(e) => {
                              const birthPlace =
                                editingContact.birthPlace || {};
                              handleEditingContactChange("birthPlace", {
                                ...birthPlace,
                                city: (e.target as HTMLInputElement).value,
                              });
                            }}
                            placeholder="Comune"
                            style={{ flex: 1 }}
                          />
                          <Input
                            value={editingContact.birthPlace?.state || ""}
                            onChange={(e) => {
                              const birthPlace =
                                editingContact.birthPlace || {};
                              handleEditingContactChange("birthPlace", {
                                ...birthPlace,
                                state: (e.target as HTMLInputElement).value,
                              });
                            }}
                            placeholder="Provincia"
                            style={{ flex: "0.5" }}
                          />
                          <Input
                            value={
                              editingContact.birthPlace?.cadastralCode || ""
                            }
                            onChange={(e) => {
                              const birthPlace =
                                editingContact.birthPlace || {};
                              handleEditingContactChange("birthPlace", {
                                ...birthPlace,
                                cadastralCode: (e.target as HTMLInputElement)
                                  .value,
                              });
                            }}
                            placeholder="Codice Catastale"
                            style={{ flex: "0.5" }}
                          />
                          <Input
                            value={editingContact.birthPlace?.country || ""}
                            onChange={(e) => {
                              const birthPlace =
                                editingContact.birthPlace || {};
                              handleEditingContactChange("birthPlace", {
                                ...birthPlace,
                                country: (e.target as HTMLInputElement).value,
                              });
                            }}
                            placeholder="Nazione"
                            style={{ flex: "0.7" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {showGender && (
                    <div style={{ marginTop: "16px" }}>
                      <div className={styles.formGroup}>
                        <label>Sesso anagrafico</label>
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "center",
                          }}
                        >
                          <select
                            value={editingContact.anagraphicSex || ""}
                            onChange={(e) => {
                              handleEditingContactChange(
                                "anagraphicSex",
                                (e.target as HTMLSelectElement).value || null
                              );
                            }}
                            style={{
                              padding: "8px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              flex: 1,
                            }}
                          >
                            <option value="">Seleziona sesso</option>
                            <option value="M">Maschio</option>
                            <option value="F">Femmina</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "16px" }}>
                    <Menu positioning="below-start">
                      <MenuTrigger disableButtonEnhancement>
                        <a
                          href="#"
                          className={styles.addNameField}
                          onClick={(e) => e.preventDefault()}
                        >
                          + Aggiungi ulteriori informazioni
                        </a>
                      </MenuTrigger>

                      <MenuPopover>
                        <MenuList>
                          {!showWebPage && (
                            <MenuItem onClick={() => setShowWebPage(true)}>
                              Pagina web personale
                            </MenuItem>
                          )}
                          {!showBirthday && (
                            <MenuItem onClick={() => setShowBirthday(true)}>
                              Compleanno
                            </MenuItem>
                          )}
                          {!showAnniversary && (
                            <MenuItem onClick={() => setShowAnniversary(true)}>
                              Anniversario
                            </MenuItem>
                          )}
                          {!showBirthPlace && (
                            <MenuItem onClick={() => setShowBirthPlace(true)}>
                              Luogo di nascita
                            </MenuItem>
                          )}
                          {!showGender && (
                            <MenuItem
                              onClick={() => setShowAnagraphicSex(true)}
                            >
                              Sesso anagrafico
                            </MenuItem>
                          )}
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    <div className={styles.formGroup}>
                      <label>Note</label>
                      <textarea
                        value={editingContact.notes || ""}
                        onChange={(e) => {
                          handleEditingContactChange("notes", e.target.value);
                          // Auto-expand the textarea
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height =
                            Math.min(target.scrollHeight, 300) + "px";
                        }}
                        onInput={(e) => {
                          // Auto-expand on input
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height =
                            Math.min(target.scrollHeight, 300) + "px";
                        }}
                        placeholder="Inserisci note sul contatto"
                        style={{
                          width: "100%",
                          minHeight: "40px",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          resize: "none",
                          overflow: "hidden",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.editPanelFooter}>
                <Button appearance="primary" onClick={handleSaveContact}>
                  Salva
                </Button>
                <Button onClick={() => setEditDialogOpen(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          ) : editingContact ? (
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <div className={styles.detailHeaderTop}>
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
                  <div>
                    <h2>
                      {editingContact.fullName ||
                        `${editingContact.firstName || ""} ${
                          editingContact.lastName || ""
                        }`.trim()}
                    </h2>
                    {(editingContact.company?.title ||
                      (typeof editingContact.company === "string"
                        ? editingContact.company
                        : editingContact.company?.name)) && (
                      <div className={styles.detailSubtitle}>
                        {editingContact.company?.title && (
                          <span>{editingContact.company.title}</span>
                        )}
                        {editingContact.company?.title &&
                          (typeof editingContact.company === "string"
                            ? editingContact.company
                            : editingContact.company?.name) && (
                            <span> presso </span>
                          )}
                        {editingContact.company?.name && (
                          <span>{editingContact.company.name}</span>
                        )}
                      </div>
                    )}
                    {editingContact.emails &&
                      editingContact.emails.length > 0 && (
                        <div className={styles.detailActions}>
                          {editingContact.phones &&
                            editingContact.phones.length > 0 && (
                              <button
                                className={styles.actionButton}
                                onClick={() => {
                                  const preferredPhone =
                                    editingContact.phones?.find(
                                      (p) => p.isPreferred
                                    ) || editingContact.phones?.[0];
                                  if (preferredPhone) {
                                    window.location.href = `tel:${preferredPhone.number}`;
                                  }
                                }}
                                title="Chiama"
                              >
                                <Call24Regular />
                              </button>
                            )}
                          {editingContact.emails &&
                            editingContact.emails.length > 0 && (
                              <button
                                className={styles.actionButton}
                                onClick={() => {
                                  const preferredEmail =
                                    editingContact.emails?.find(
                                      (e) => e.isPreferred
                                    ) || editingContact.emails?.[0];
                                  if (preferredEmail) {
                                    window.location.href = `mailto:${preferredEmail.email}`;
                                  }
                                }}
                                title="Invia email"
                              >
                                <Mail24Regular />
                              </button>
                            )}
                        </div>
                      )}
                  </div>
                </div>
                <Button
                  icon={<Edit24Regular />}
                  appearance="primary"
                  size="small"
                  onClick={handleEditContact}
                >
                  Modifica
                </Button>
              </div>

              <div className={styles.detailFields}>
                {editingContact.prefix && (
                  <div className={styles.field}>
                    <span className={styles.label}>Titolo onorifico:</span>
                    <span>{editingContact.prefix}</span>
                  </div>
                )}

                {editingContact.firstName && (
                  <div className={styles.field}>
                    <span className={styles.label}>Nome:</span>
                    <span>{editingContact.firstName}</span>
                  </div>
                )}

                {editingContact.middleName && (
                  <div className={styles.field}>
                    <span className={styles.label}>Secondo nome:</span>
                    <span>{editingContact.middleName}</span>
                  </div>
                )}

                {editingContact.lastName && (
                  <div className={styles.field}>
                    <span className={styles.label}>Cognome:</span>
                    <span>{editingContact.lastName}</span>
                  </div>
                )}
                {editingContact.notes && (
                  <div className={styles.field}>
                    <span className={styles.label}>Note:</span>
                    <span>{editingContact.notes}</span>
                  </div>
                )}
                {editingContact.suffix && (
                  <div className={styles.field}>
                    <span className={styles.label}>Suffisso:</span>
                    <span>{editingContact.suffix}</span>
                  </div>
                )}

                {editingContact.phoneticFirstName && (
                  <div className={styles.field}>
                    <span className={styles.label}>Nome fonetico:</span>
                    <span>{editingContact.phoneticFirstName}</span>
                  </div>
                )}

                {editingContact.phoneticLastName && (
                  <div className={styles.field}>
                    <span className={styles.label}>Cognome fonetico:</span>
                    <span>{editingContact.phoneticLastName}</span>
                  </div>
                )}

                {editingContact.company && (
                  <div className={styles.field}>
                    <span className={styles.label}>Azienda:</span>
                    <span>
                      {typeof editingContact.company === "string"
                        ? editingContact.company
                        : editingContact.company.name}
                    </span>
                  </div>
                )}

                {typeof editingContact.company !== "string" &&
                  editingContact.company?.title && (
                    <div className={styles.field}>
                      <span className={styles.label}>Ruolo aziendale:</span>
                      <span>{editingContact.company.title}</span>
                    </div>
                  )}

                {editingContact.emails && editingContact.emails.length > 0 && (
                  <div className={styles.field}>
                    <span className={styles.label}>Email:</span>
                    <div className={styles.fieldList}>
                      {editingContact.emails.map((email) => (
                        <div key={`detail-email-${email.id}`}>
                          {email.email}
                          {email.isPreferred && (
                            <span className={styles.fieldType}>
                              (Preferred)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editingContact.phones && editingContact.phones.length > 0 && (
                  <div className={styles.field}>
                    <span className={styles.label}>Telefono:</span>
                    <div className={styles.fieldList}>
                      {editingContact.phones.map((phone) => (
                        <div key={`detail-phone-${phone.id}`}>
                          {phone.number}
                          {phone.type && (
                            <span className={styles.fieldType}>
                              ({phone.type})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editingContact.birthday && (
                  <div className={styles.field}>
                    <span className={styles.label}>Compleanno:</span>
                    <span>
                      {editingContact.birthday.day.toString().padStart(2, "0")}-
                      {editingContact.birthday.month
                        .toString()
                        .padStart(2, "0")}
                      {editingContact.birthday.year &&
                        `-${editingContact.birthday.year}`}
                    </span>
                  </div>
                )}

                {editingContact.anniversary && (
                  <div className={styles.field}>
                    <span className={styles.label}>Anniversario:</span>
                    <span>
                      {editingContact.anniversary.day
                        .toString()
                        .padStart(2, "0")}
                      -
                      {editingContact.anniversary.month
                        .toString()
                        .padStart(2, "0")}
                      {editingContact.anniversary.year &&
                        `-${editingContact.anniversary.year}`}
                    </span>
                  </div>
                )}

                {editingContact.addresses &&
                  editingContact.addresses.length > 0 && (
                    <div className={styles.field}>
                      <span className={styles.label}>Indirizzi:</span>
                      <div className={styles.fieldList}>
                        {editingContact.addresses.map((address) => (
                          <div key={`detail-address-${address.id}`}>
                            {address.street && <div>{address.street}</div>}
                            <div>
                              {address.postalCode && `${address.postalCode} `}
                              {address.city}
                              {address.country && `, ${address.country}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {editingContact.labels && editingContact.labels.length > 0 && (
                  <div className={styles.field}>
                    <span className={styles.label}>Etichette:</span>
                    <div className={styles.fieldList}>
                      {editingContact.labels.map((label, idx) => (
                        <span key={idx} className={styles.badge}>
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.detailEmpty}>
              <p>Seleziona un contatto per visualizzare i dettagli</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contacts;
