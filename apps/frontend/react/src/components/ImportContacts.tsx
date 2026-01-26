import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  Input,
  Label,
  Link,
  SpinButton,
} from "@fluentui/react-components";
import React, { useState } from "react";

interface ImportContactsDialogProp {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportContactsDialog: React.FC<ImportContactsDialogProp> = ({
  open,
  onOpenChange,
}) => {
  const [currentStep, setCurrentStep] = useState<
    | "file-selection"
    | "select-mapping"
    | "mapping"
    | "summary"
    | "import-progress"
    | "import-complete"
  >("file-selection");
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(
    null
  );
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    total: number;
    totalRows?: number;
    message: string;
  } | null>(null);
  const [importProgress, setImportProgress] = useState<string>(
    "Preparazione importazione..."
  );
  const DEST_ENTITIES = [
    "contact",
    "email",
    "phone",
    "address",
    "company",
    "website",
    "taxId",
  ] as const;
  type DestEntity = (typeof DEST_ENTITIES)[number];

  const CONTACT_FIELDS: { value: string; label: string }[] = [
    { value: "firstName", label: "Nome" },
    { value: "middleName", label: "Secondo nome" },
    { value: "lastName", label: "Cognome" },
    { value: "prefix", label: "Prefisso" },
    { value: "suffix", label: "Suffisso" },
    { value: "fullName", label: "Nome completo" },
    { value: "phoneticName", label: "Pronuncia nome" },
    { value: "phoneticMiddlename", label: "Pronuncia secondo nome" },
    { value: "phoneticsurname", label: "Pronuncia cognome" },
    { value: "photoUrl", label: "Foto" },
    { value: "nickname", label: "Nickname" },
    { value: "labels", label: "Etichette" },
    { value: "type", label: "Tipologia" },
    { value: "notes", label: "Note" },
    { value: "birthday", label: "Compleanno" },
    { value: "anniversary", label: "Anniversario" },
  ];
  const EMAIL_FIELDS: { value: string; label: string }[] = [
    { value: "email", label: "Indirizzo" },
    { value: "label", label: "Etichetta" },
    { value: "isPrimary", label: "Primaria" },
  ];
  const PHONE_FIELDS: { value: string; label: string }[] = [
    { value: "number", label: "Numero" },
    { value: "label", label: "Etichetta" },
    { value: "isPrimary", label: "Primario" },
  ];
  const ADDRESS_FIELDS: { value: string; label: string }[] = [
    { value: "street", label: "Via" },
    { value: "street2", label: "Dettagli (interno, ecc.)" },
    { value: "city", label: "Città" },
    { value: "state", label: "Provincia/Regione" },
    { value: "country", label: "Paese" },
    { value: "postalCode", label: "CAP" },
    { value: "label", label: "Etichetta" },
    { value: "poBox", label: "PO Box" },
    { value: "formatted", label: "Indirizzo formattato" },
    { value: "isPrimary", label: "Primario" },
  ];
  const COMPANY_FIELDS: { value: string; label: string }[] = [
    { value: "name", label: "Nome" },
    { value: "department", label: "Dipartimento" },
    { value: "title", label: "Titolo" },
  ];
  const WEBSITE_FIELDS: { value: string; label: string }[] = [
    { value: "url", label: "Indirizzo" },
    { value: "label", label: "Etichetta" },
  ];
  const TAX_ID_FIELDS: { value: string; label: string }[] = [
    { value: "number", label: "Numero" },
    { value: "type", label: "Tipo" },
  ];
  const TYPE_OPTIONS: { value: "HOME" | "WORK"; label: string }[] = [
    { value: "HOME", label: "Casa" },
    { value: "WORK", label: "Lavoro" },
  ];

  const parseMappingValue = (
    value: string | undefined
  ): {
    entity: DestEntity;
    field: string;
    type?: "HOME" | "WORK";
    arrayIndex?: number;
  } => {
    if (!value || value.trim() === "") {
      return { entity: "contact", field: "" } as any;
    }

    // Check for array notation: entity[index].field or entity.type[index].field
    let arrayIndex: number | undefined = undefined;
    let normalizedValue = value;

    const arrayMatch = value.match(/^(.+?)\[(\d+)\]$/);
    if (arrayMatch) {
      normalizedValue = arrayMatch[1];
      arrayIndex = parseInt(arrayMatch[2], 10);
    }

    const parts = normalizedValue.split(".");
    if (parts.length === 1) {
      return { entity: "contact", field: parts[0], arrayIndex } as any;
    }
    const [entityRaw, maybeTypeOrField, maybeField] = parts;
    const entity = (entityRaw as DestEntity) || "contact";
    if (entity === "contact") {
      return { entity, field: maybeTypeOrField, arrayIndex } as any;
    }
    const type = (maybeField ? maybeTypeOrField : undefined) as
      | "HOME"
      | "WORK"
      | undefined;
    const field = (maybeField ?? maybeTypeOrField) as string;
    return { entity, field, type, arrayIndex } as any;
  };

  const buildMappingValue = (
    entity: DestEntity,
    field: string,
    type?: "HOME" | "WORK",
    arrayIndex?: number
  ): string => {
    let baseValue = "";
    if (entity === "contact") {
      baseValue = `contact.${field}`;
    } else {
      baseValue = type ? `${entity}.${type}.${field}` : `${entity}.${field}`;
    }

    if (arrayIndex !== undefined && arrayIndex >= 0) {
      baseValue += `[${arrayIndex}]`;
    }

    return baseValue;
  };
  // const CONTACT_FIELD_OPTIONS: { value: string; label: string }[] = [
  //   { value: "firstName", label: "Nome" },
  //   { value: "lastName", label: "Cognome" },
  //   { value: "fullName", label: "Nome completo" },
  //   { value: "email", label: "Email" },
  //   { value: "phone", label: "Telefono" },
  //   { value: "address", label: "Indirizzo" },
  //   { value: "city", label: "Città" },
  //   { value: "country", label: "Paese" },
  //   { value: "postalCode", label: "CAP" },
  // ];

  const [currentColumnIndex, setCurrentColumnIndex] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [displayHeaders, setDisplayHeaders] = useState<string[]>([]);
  const [filePreview, setFilePreview] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<[Record<string, string>, boolean]>([
    {},
    false,
  ]);
  const [mappingLoaded, setMappingLoaded] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [mappingName, setMappingName] = useState<string>("");
  const [mappingDescription, setMappingDescription] = useState<string>("");
  const [availableMappings, setAvailableMappings] = useState<any[]>([]);
  const [headerHash, setHeaderHash] = useState<string>("");

  // console.log("ImportContactsDialog render, open:", open);

  const normalizeHeader = (header: string): string => {
    return header
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const generateHeadersHash = async (headers: string[]): Promise<string> => {
    const sortedHeaders = [...headers].sort().join("|");
    const encoder = new TextEncoder();
    const data = encoder.encode(sortedHeaders);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const getAvailableMappingsByHash = async (
    headerHash: string
  ): Promise<any[]> => {
    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/mappings/${headerHash}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        console.warn("No mappings found for this header hash");
        return [];
      }

      const data = await response.json();
      // console.log("Available mappings loaded:", data);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error("Error fetching available mappings:", error);
      return [];
    }
  };

  const getMappingRulesByHash = async (
    headerHash: string
  ): Promise<Record<string, string>> => {
    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/mappings/${headerHash}/rules`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        console.warn("No rules found for this header hash");
        return {};
      }

      const data = await response.json();
      // console.log("Mapping rules loaded:", data);
      return data || {};
    } catch (error) {
      console.error("Error fetching mapping rules:", error);
      return {};
    }
  };

  const findOrCreateMapping = async (
    headerNormalized: string[],
    headerHash: string
  ): Promise<[Record<string, string>, boolean]> => {
    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/mappings/find-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sourceType: "contacts",
            headers: fileHeaders,
            headerNormalized,
            headerHash,
            headerHashAlgorithm: "SHA-256",
          }),
        }
      );

      if (!response.ok) {
        let errMsg = "Failed to fetch mapping from backend";
        try {
          const err = await response.json();
          if (err?.message) errMsg = err.message;
        } catch {}
        console.error(errMsg);
        throw new Error(errMsg);
      }

      const data = await response.json();
      // Backend returns [MappingEntity, boolean]. Extract the plain mapping object.
      if (Array.isArray(data)) {
        const [entity, created] = data as [
          { mapping?: Record<string, string> },
          boolean,
        ];
        return [entity?.mapping ?? {}, created] as [
          Record<string, string>,
          boolean,
        ];
      }
      // Fallback: if backend already returns [mapping, boolean]
      return data as [Record<string, string>, boolean];
    } catch (error) {
      console.error("Error fetching mapping:", error);
      throw error;
    }
  };

  const saveMappingToBackend = async (
    headerNormalized: string[],
    headerHash: string,
    mappingData: Record<string, string>
  ): Promise<boolean> => {
    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/mappings/${headerHash}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sourceType: "csv",
            headers: fileHeaders,
            headerNormalized,
            headerHash,
            headerHashAlgorithm: "SHA-256",
            mapping: mappingData,
            name: mappingName || undefined,
            description: mappingDescription || undefined,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to save mapping to backend");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving mapping:", error);
      return false;
    }
  };

  const updateMappingRules = async (
    headerHash: string,
    mappingRules: Record<string, string>
  ): Promise<boolean> => {
    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/mappings/${headerHash}/rules`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rules: mappingRules,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update mapping rules");
        return false;
      }

      // console.log("Mapping rules updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating mapping rules:", error);
      return false;
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const mime = file.type || "";

    // Parse file to extract headers
    const text = await file.text();
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    // Decide by extension first, then confirm/override by mimetype
    let isCsv = fileExtension === "csv";
    let isVcf = fileExtension === "vcf";
    if (mime) {
      const mimeIsCsv = /csv|text\/csv/i.test(mime);
      const mimeIsVcf = /vcf|vcard|text\/vcard/i.test(mime);
      // If mime suggests csv, prefer csv
      if (mimeIsCsv) {
        isCsv = true;
        isVcf = false;
      }
      // If mime suggests vcf, prefer vcf
      else if (mimeIsVcf) {
        isVcf = true;
        isCsv = false;
      }
    }

    if (isCsv) {
      const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
      if (lines.length > 0) {
        // Try to detect delimiter (comma/semicolon/tab)
        const firstLine = lines[0];
        const delimiter = firstLine.includes("\t")
          ? "\t"
          : firstLine.includes(";")
            ? ";"
            : ",";
        const rawHeaders = firstLine.split(delimiter).map((h) => h.trim());
        const normalizedHeaders: string[] = rawHeaders.map(normalizeHeader);
        setDisplayHeaders(rawHeaders);
        setFileHeaders(normalizedHeaders);

        // No explicit column type mapping is required

        // Build preview first so UI is responsive even if backend mapping fails
        const previewData = lines
          .slice(1, 11)
          .map((line) => line.split(delimiter).map((cell) => cell.trim()));
        setFilePreview(previewData);

        // Generate hash and fetch mapping from backend (non-blocking for preview)
        try {
          const headersHash = await generateHeadersHash(normalizedHeaders);
          setHeaderHash(headersHash);

          // Fetch available mappings for this header hash
          const availableMaps = await getAvailableMappingsByHash(headersHash);
          setAvailableMappings(availableMaps);

          const [suggestedMapping, created] = await findOrCreateMapping(
            normalizedHeaders,
            headersHash
          );

          if (created) {
            setMapping([suggestedMapping, created]);
            setMappingLoaded(created);
          } else {
            setMappingLoaded(created);
          }
        } catch (e) {
          console.error("Mapping suggestion unavailable:", e);
          setMappingLoaded(false);
        }
      }
    } else if (isVcf) {
      // Basic VCF parsing for preview
      const headers = ["Name", "Email", "Phone", "Company"];
      setDisplayHeaders(headers);
      setFileHeaders(headers.map(normalizeHeader));
      setFilePreview([["Sample VCF data preview"]]);
    }
  };

  const autoSuggestFromHeaders = (
    headers: string[]
  ): Record<string, string> => {
    const suggestions: Record<string, string> = {};
    const matchers: Array<{ test: (h: string) => boolean; dest: string }> = [
      { test: (h) => /^(first_?name|nome)$/.test(h), dest: "firstName" },
      { test: (h) => /^(last_?name|cognome)$/.test(h), dest: "lastName" },
      {
        test: (h) => /^(full_?name|nome_?completo|name)$/.test(h),
        dest: "fullName",
      },
      { test: (h) => /^(email|mail)$/.test(h), dest: "email" },
      { test: (h) => /^(phone|telefono|mobile|cell)$/.test(h), dest: "phone" },
      { test: (h) => /^(address|indirizzo)$/.test(h), dest: "address" },
      { test: (h) => /^(city|citta|città)$/.test(h), dest: "city" },
      { test: (h) => /^(country|paese)$/.test(h), dest: "country" },
      { test: (h) => /^(postal_?code|zip|cap)$/.test(h), dest: "postalCode" },
      { test: (h) => /^(tipo|tipologia|type)$/.test(h), dest: "type" },
      {
        test: (h) =>
          /^(tipo_?custom|tipologia_?personalizzata|custom_?type|categoria)$/.test(
            h
          ),
        dest: "customType",
      },
      {
        test: (h) => /^(note|notes|osservazioni|commenti)$/.test(h),
        dest: "notes",
      },
    ];
    for (const h of headers) {
      const m = matchers.find((m) => m.test(h));
      if (m) suggestions[h] = m.dest;
    }
    return suggestions;
  };

  const handleNextStep = async () => {
    if (currentStep === "file-selection" && selectedFile) {
      setCurrentColumnIndex(0);
      setCurrentStep("select-mapping");
    } else if (currentStep === "select-mapping") {
      // Se l'utente ha selezionato un mapping esistente, caricalo
      if (selectedMappingId && headerHash) {
        try {
          // Trova il mapping selezionato tra quelli disponibili
          const selectedMapping = availableMappings.find(
            (m) => m.id === selectedMappingId
          );
          if (selectedMapping && selectedMapping.mapping) {
            // Imposta il mapping selezionato
            setMapping([selectedMapping.mapping, false]);
            // Se il mapping ha un nome, impostalo
            if (selectedMapping.name) {
              setMappingName(selectedMapping.name);
            }
            if (selectedMapping.description) {
              setMappingDescription(selectedMapping.description);
            }
          }
        } catch (error) {
          console.error("Error loading selected mapping:", error);
        }
      }
      // Vai allo step di mapping (per creare nuovo o modificare esistente)
      setCurrentColumnIndex(0);
      setCurrentStep("mapping");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "select-mapping") {
      setCurrentStep("file-selection");
    } else if (currentStep === "mapping") {
      if (currentColumnIndex > 0) {
        setCurrentColumnIndex((i) => i - 1);
      } else {
        setCurrentStep("select-mapping");
      }
    } else if (currentStep === "summary") {
      // Return to mapping on the last column for convenience
      setCurrentStep("mapping");
      setCurrentColumnIndex(
        fileHeaders.length > 0 ? fileHeaders.length - 1 : 0
      );
    }
  };

  const resetDialog = () => {
    setCurrentStep("file-selection");
    setCurrentColumnIndex(0);
    setSelectedFile(null);
    setFileHeaders([]);
    setFilePreview([]);
    setMapping([{}, false]);
    setAvailableMappings([]);
    setHeaderHash("");
    setSelectedMappingId(null);
  };

  return (
    <>
      <style>
        {`
          /* Custom styles for the dialog */
          .import-contacts-dialog .ms-Dialog-main {
            max-width: 900px;
          }
          .import-contacts-dialog .ms-Dialog-body {
            padding: 0;
          }
          .import-contacts-dialog .ms-Dialog-content {
            height: 500px;
            overflow: hidden;
            padding: 0;
          }
        `}
      </style>

      <Dialog
        open={open}
        onOpenChange={(_, data) => onOpenChange(data.open)}
        modalType="modal"
      >
        <DialogSurface
          style={{
            maxWidth: "1200px",
            height: "calc(100vh - 80px)",
            padding: 0,
          }}
        >
          <DialogBody style={{ padding: 0, height: "100%" }}>
            <DialogContent
              className="DialogContent"
              style={{ padding: 0, margin: 0, height: "100%" }}
            >
              {currentStep === "file-selection" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40% 60%",
                    gap: "0",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f5f5f5",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                        Importa contatti
                      </h2>
                      <p
                        style={{
                          marginBottom: "16px",
                          lineHeight: "1.5",
                          color: "#605e5c",
                        }}
                      >
                        Puoi importare i contatti da altre app di posta
                        elettronica utilizzando un file con valori separati da
                        virgola (CSV). Per ottenere i migliori risultati,
                        assicurati che il file abbia la codifica UTF-8.
                      </p>
                      <p
                        style={{
                          marginBottom: "16px",
                          lineHeight: "1.5",
                          color: "#605e5c",
                        }}
                      >
                        Ad esempio, esporta i tuoi contatti da Gmail in formato
                        CSV e poi importali in Outlook.
                      </p>
                      <p
                        style={{
                          marginBottom: "16px",
                          lineHeight: "1.5",
                          color: "#605e5c",
                        }}
                      >
                        I contatti importati non sovrascriveranno nessuno dei
                        tuoi contatti esistenti.
                      </p>
                    </div>
                    <Link href="#">Approfondisci</Link>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "16px",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      Importa il tuo file CSV
                    </h3>
                    <div style={{ marginBottom: "16px" }}>
                      <Label htmlFor="file-input">Seleziona file</Label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <Input
                          id="file-input"
                          type="text"
                          readOnly
                          value={
                            selectedFile
                              ? selectedFile.name
                              : "Nessun file selezionato"
                          }
                          style={{ flex: 1 }}
                        />
                        <Button
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".csv,.vcf";
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) await handleFileSelect(file);
                            };
                            input.click();
                          }}
                        >
                          Sfoglia
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "select-mapping" && (
                <div
                  style={{ padding: "24px", height: "100%", overflow: "auto" }}
                >
                  <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                    Seleziona Mapping
                  </h2>
                  <p style={{ marginBottom: "16px", color: "#605e5c" }}>
                    Abbiamo trovato {availableMappings.length} mapping{" "}
                    {availableMappings.length === 1 ? "salvato" : "salvati"} per
                    questo header. Puoi usarne uno esistente oppure crearne uno
                    nuovo.
                  </p>

                  {availableMappings.length > 0 && (
                    <div
                      style={{
                        marginBottom: "24px",
                        padding: "16px",
                        border: "1px solid #107c10",
                        borderRadius: "4px",
                        background: "#f0f8f4",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "14px",
                          marginTop: 0,
                          marginBottom: "12px",
                          color: "#107c10",
                        }}
                      >
                        Mapping disponibili
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {availableMappings.map((m) => (
                          <div
                            key={m.id}
                            style={{
                              padding: "12px",
                              border:
                                selectedMappingId === m.id
                                  ? "2px solid #107c10"
                                  : "1px solid #e0e0e0",
                              borderRadius: "4px",
                              background:
                                selectedMappingId === m.id ? "#f0f8f4" : "#fff",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => setSelectedMappingId(m.id)}
                          >
                            <div style={{ flex: 1 }}>
                              <strong>{m.name || "Mapping senza nome"}</strong>
                              {m.description && (
                                <div
                                  style={{
                                    color: "#605e5c",
                                    fontSize: "12px",
                                    marginTop: "4px",
                                  }}
                                >
                                  {m.description}
                                </div>
                              )}
                            </div>
                            {selectedMappingId === m.id && (
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  background: "#107c10",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}
                              >
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      padding: "16px",
                      border: "1px solid #ffc800",
                      borderRadius: "4px",
                      background: "#fffcf0",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "14px",
                        marginTop: 0,
                        marginBottom: "8px",
                        color: "#8a7d2a",
                      }}
                    >
                      Oppure crea un nuovo mapping
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#605e5c",
                        margin: 0,
                      }}
                    >
                      Puoi anche creare una nuova mappatura personalizzata per
                      questo file.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === "mapping" && (
                <div
                  style={{ padding: "24px", height: "100%", overflow: "auto" }}
                >
                  <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                    Mappatura campi
                  </h2>
                  <p style={{ marginBottom: "8px", color: "#605e5c" }}>
                    Associa i campi del file CSV ai campi dei contatti.
                  </p>
                  <p
                    style={{
                      marginTop: 0,
                      marginBottom: "16px",
                      color: "#605e5c",
                      fontSize: 12,
                    }}
                  >
                    Colonna {fileHeaders.length ? currentColumnIndex + 1 : 0} di{" "}
                    {fileHeaders.length}
                  </p>

                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "14px",
                          marginBottom: "12px",
                          marginTop: 0,
                        }}
                      >
                        Anteprima file
                      </h3>
                      <Button
                        size="small"
                        onClick={() => setShowPreview((v) => !v)}
                      >
                        {showPreview ? "Nascondi" : "Mostra"} anteprima
                      </Button>
                    </div>
                    {showPreview && (
                      <div
                        style={{
                          overflowX: "auto",
                          overflowY: "auto",
                          maxHeight: 260,
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          background: "#fff",
                        }}
                      >
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                              {displayHeaders.map((header, idx) => (
                                <th
                                  key={idx}
                                  style={{
                                    padding: "8px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #e0e0e0",
                                    backgroundColor:
                                      idx === currentColumnIndex
                                        ? "#eaf6ff"
                                        : undefined,
                                  }}
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filePreview.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={Math.max(1, displayHeaders.length)}
                                  style={{ padding: 8, color: "#605e5c" }}
                                >
                                  Nessuna riga di dati trovata (mostrata solo
                                  l'intestazione).
                                </td>
                              </tr>
                            ) : (
                              filePreview.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  {row.map((cell, cellIdx) => (
                                    <td
                                      key={cellIdx}
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #e0e0e0",
                                        backgroundColor:
                                          cellIdx === currentColumnIndex
                                            ? "#eaf6ff"
                                            : undefined,
                                        fontWeight:
                                          cellIdx === currentColumnIndex
                                            ? 600
                                            : undefined,
                                      }}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 style={{ fontSize: "14px", marginBottom: "12px" }}>
                      Mappatura
                    </h3>
                    {mappingLoaded && fileHeaders[currentColumnIndex] && (
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          background: "#f9f9f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div>
                          <strong style={{ display: "block", marginBottom: 8 }}>
                            Mappatura suggerita
                          </strong>
                          <div style={{ margin: 0 }}>
                            <code>{fileHeaders[currentColumnIndex]}</code> →{" "}
                            <code>
                              {mapping[0][fileHeaders[currentColumnIndex]] ||
                                "(non mappato)"}
                            </code>
                          </div>
                        </div>
                        <Button
                          size="small"
                          onClick={() => {
                            const suggestions =
                              autoSuggestFromHeaders(fileHeaders);
                            setMapping([
                              { ...mapping[0], ...suggestions },
                              mapping[1],
                            ]);
                          }}
                        >
                          Suggerisci automaticamente
                        </Button>
                      </div>
                    )}
                    {fileHeaders[currentColumnIndex] && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            minWidth: "150px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            paddingTop: 4,
                          }}
                        >
                          <Label>Colonna</Label>
                          <div
                            style={{ fontFamily: "monospace", fontSize: 13 }}
                          >
                            {fileHeaders[currentColumnIndex]}
                          </div>
                        </div>
                        <span style={{ paddingTop: 8 }}>→</span>
                        {/* Tipo campo removed per requirements */}
                        <div style={{ display: "flex", gap: 12, flex: 1 }}>
                          {/* Entità */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <Label htmlFor={`entity-${currentColumnIndex}`}>
                              Entità
                            </Label>
                            {(() => {
                              const current = parseMappingValue(
                                mapping[0][fileHeaders[currentColumnIndex]]
                              );
                              const entity = current.entity || "contact";
                              return (
                                <select
                                  id={`entity-${currentColumnIndex}`}
                                  style={{
                                    width: 160,
                                    padding: "6px",
                                    borderRadius: 4,
                                    border: "1px solid #ccc",
                                  }}
                                  value={entity}
                                  onChange={(e) => {
                                    const newEntity = e.target
                                      .value as DestEntity;
                                    const defaultField =
                                      newEntity === "contact"
                                        ? CONTACT_FIELDS[0].value
                                        : newEntity === "email"
                                          ? EMAIL_FIELDS[0].value
                                          : newEntity === "phone"
                                            ? PHONE_FIELDS[0].value
                                            : newEntity === "address"
                                              ? ADDRESS_FIELDS[0].value
                                              : newEntity === "company"
                                                ? COMPANY_FIELDS[0].value
                                                : newEntity === "website"
                                                  ? WEBSITE_FIELDS[0].value
                                                  : TAX_ID_FIELDS[0].value;
                                    const newValue = buildMappingValue(
                                      newEntity,
                                      defaultField,
                                      current.type,
                                      current.arrayIndex
                                    );
                                    setMapping([
                                      {
                                        ...mapping[0],
                                        [fileHeaders[currentColumnIndex]]:
                                          newValue,
                                      },
                                      mapping[1],
                                    ]);
                                  }}
                                >
                                  {DEST_ENTITIES.map((e) => (
                                    <option key={e} value={e}>
                                      {e === "contact"
                                        ? "Contatto"
                                        : e === "email"
                                          ? "Email"
                                          : e === "phone"
                                            ? "Telefono"
                                            : e === "address"
                                              ? "Indirizzo"
                                              : e === "company"
                                                ? "Azienda"
                                                : e === "website"
                                                  ? "Sito web"
                                                  : "Identificativo Fiscale"}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
                          </div>
                          {/* Campo */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              flex: 1,
                            }}
                          >
                            <Label htmlFor={`field-${currentColumnIndex}`}>
                              Campo
                            </Label>
                            {(() => {
                              const current = parseMappingValue(
                                mapping[0][fileHeaders[currentColumnIndex]]
                              );
                              const entity = current.entity || "contact";
                              const fieldVal = current.field || "";
                              const options =
                                entity === "contact"
                                  ? CONTACT_FIELDS
                                  : entity === "email"
                                    ? EMAIL_FIELDS
                                    : entity === "phone"
                                      ? PHONE_FIELDS
                                      : entity === "address"
                                        ? ADDRESS_FIELDS
                                        : entity === "company"
                                          ? COMPANY_FIELDS
                                          : entity === "website"
                                            ? WEBSITE_FIELDS
                                            : TAX_ID_FIELDS;
                              return (
                                <select
                                  id={`field-${currentColumnIndex}`}
                                  style={{
                                    flex: 1,
                                    padding: "6px",
                                    borderRadius: 4,
                                    border: "1px solid #ccc",
                                  }}
                                  value={fieldVal}
                                  onChange={(e) => {
                                    const newField = e.target.value;
                                    const newValue = buildMappingValue(
                                      entity as DestEntity,
                                      newField,
                                      current.type,
                                      current.arrayIndex
                                    );
                                    setMapping([
                                      {
                                        ...mapping[0],
                                        [fileHeaders[currentColumnIndex]]:
                                          newValue,
                                      },
                                      mapping[1],
                                    ]);
                                  }}
                                  title="Campo target"
                                >
                                  <option value="">-- Non mappare --</option>
                                  {options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
                          </div>
                          {/* Tipo (non contatto) */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <Label htmlFor={`type-${currentColumnIndex}`}>
                              Tipo
                            </Label>
                            {(() => {
                              const current = parseMappingValue(
                                mapping[0][fileHeaders[currentColumnIndex]]
                              );
                              const entity = current.entity || "contact";
                              const typeVal = current.type ?? "";
                              return entity === "contact" ||
                                entity === "company" ||
                                entity === "website" ||
                                entity === "taxId" ? (
                                <Input
                                  id={`type-${currentColumnIndex}`}
                                  readOnly
                                  value="N/A"
                                  style={{ width: 100 }}
                                />
                              ) : (
                                <select
                                  id={`type-${currentColumnIndex}`}
                                  style={{
                                    width: 120,
                                    padding: "6px",
                                    borderRadius: 4,
                                    border: "1px solid #ccc",
                                  }}
                                  value={typeVal}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newType =
                                      val === ""
                                        ? undefined
                                        : (val as "HOME" | "WORK");
                                    const newValue = buildMappingValue(
                                      entity as DestEntity,
                                      current.field,
                                      newType,
                                      current.arrayIndex
                                    );
                                    setMapping([
                                      {
                                        ...mapping[0],
                                        [fileHeaders[currentColumnIndex]]:
                                          newValue,
                                      },
                                      mapping[1],
                                    ]);
                                  }}
                                >
                                  <option value="">Nessuno</option>
                                  {TYPE_OPTIONS.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
                          </div>
                          {/* Indice Array */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <Label
                              htmlFor={`array-index-${currentColumnIndex}`}
                            >
                              Indice Array
                            </Label>
                            {(() => {
                              const current = parseMappingValue(
                                mapping[0][fileHeaders[currentColumnIndex]]
                              );
                              const entity = current.entity || "contact";
                              const arrayIndexVal = current.arrayIndex ?? 0;
                              const showArrayIndex =
                                entity !== "contact" &&
                                entity !== "company" &&
                                entity !== "website" &&
                                entity !== "taxId";

                              return (
                                <SpinButton
                                  id={`array-index-${currentColumnIndex}`}
                                  value={
                                    showArrayIndex ? Number(arrayIndexVal) : -1
                                  }
                                  onChange={(e, data) => {
                                    if (!showArrayIndex) return;
                                    const newIndex =
                                      data.value !== undefined
                                        ? parseInt(String(data.value), 10)
                                        : 0;
                                    const newValue = buildMappingValue(
                                      entity as DestEntity,
                                      current.field,
                                      current.type,
                                      newIndex >= 0 ? newIndex : undefined
                                    );
                                    setMapping([
                                      {
                                        ...mapping[0],
                                        [fileHeaders[currentColumnIndex]]:
                                          newValue,
                                      },
                                      mapping[1],
                                    ]);
                                  }}
                                  min={0}
                                  max={10}
                                  step={1}
                                  disabled={!showArrayIndex}
                                  style={{ width: 100 }}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                    {fileHeaders[currentColumnIndex] && (
                      <div style={{ marginTop: 8 }}>
                        <h4 style={{ fontSize: 12, margin: "8px 0" }}>
                          Anteprima colonna
                        </h4>
                        <div
                          style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 4,
                            padding: 8,
                            maxWidth: "100%",
                            background: "#fff",
                          }}
                        >
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {filePreview.slice(0, 5).map((row, i) => (
                              <li key={i}>
                                <code>
                                  {Array.isArray(row)
                                    ? (row[currentColumnIndex] ?? "")
                                    : ""}
                                </code>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {fileHeaders.length > 0 && (
                      <div style={{ fontSize: 12, color: "#605e5c" }}>
                        Mappate:{" "}
                        {Object.values(mapping[0] || {}).filter(Boolean).length}{" "}
                        / {fileHeaders.length}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === "summary" && (
                <div
                  style={{ padding: "24px", height: "100%", overflow: "auto" }}
                >
                  <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                    Riepilogo mappatura
                  </h2>
                  <p style={{ marginBottom: "12px", color: "#605e5c" }}>
                    Verifica le associazioni tra le colonne del CSV e i campi di
                    destinazione.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 16,
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <Label htmlFor="mapping-name">Nome mappatura</Label>
                      <Input
                        id="mapping-name"
                        placeholder="Es. Import contatti Gmail"
                        value={mappingName}
                        onChange={(_, data) => setMappingName(data.value)}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <Label htmlFor="mapping-description">Descrizione</Label>
                      <textarea
                        id="mapping-description"
                        placeholder="Descrizione opzionale della mappatura"
                        value={mappingDescription}
                        onChange={(e) => setMappingDescription(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: 80,
                          padding: 8,
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          fontFamily: "inherit",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      overflowX: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 4,
                      background: "#fff",
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                          <th
                            style={{
                              padding: 8,
                              textAlign: "left",
                              borderBottom: "1px solid #e0e0e0",
                            }}
                          >
                            Colonna CSV
                          </th>
                          <th
                            style={{
                              padding: 8,
                              textAlign: "left",
                              borderBottom: "1px solid #e0e0e0",
                            }}
                          >
                            Campo destinazione
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fileHeaders.map((normalized, idx) => (
                          <tr key={normalized}>
                            <td
                              style={{
                                padding: 8,
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {displayHeaders[idx] || normalized}
                            </td>
                            <td
                              style={{
                                padding: 8,
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {(() => {
                                // Il mapping è nel formato { csvColumn: destination }
                                // Cerchiamo la destinazione usando il csvColumn normalizzato come chiave
                                let mappedValue = mapping[0][normalized];

                                if (!mappedValue) {
                                  // console.log(
                                  //   `No mapping found for column: ${normalized}, mapping:`,
                                  //   mapping[0]
                                  // );
                                  return "(non mappato)";
                                }
                                const { entity, type, field } =
                                  parseMappingValue(mappedValue);
                                const entityLabel =
                                  entity === "contact"
                                    ? "Contatto"
                                    : entity === "email"
                                      ? "Email"
                                      : entity === "phone"
                                        ? "Telefono"
                                        : entity === "address"
                                          ? "Indirizzo"
                                          : entity === "company"
                                            ? "Azienda"
                                            : entity === "website"
                                              ? "Sito web"
                                              : "Identificativo Fiscale";
                                const typeLabel = type
                                  ? type === "HOME"
                                    ? "Casa"
                                    : "Lavoro"
                                  : undefined;
                                return typeLabel
                                  ? `${entityLabel} (${typeLabel}).${field}`
                                  : `${entityLabel}.${field}`;
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {fileHeaders.length > 0 && (
                    <div
                      style={{ fontSize: 12, color: "#605e5c", marginTop: 8 }}
                    >
                      Mappate:{" "}
                      {Object.values(mapping[0] || {}).filter(Boolean).length} /{" "}
                      {fileHeaders.length}
                    </div>
                  )}
                </div>
              )}

              {currentStep === "import-progress" && (
                <div
                  style={{
                    padding: "24px",
                    height: "100%",
                    overflow: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 24px",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          border: "4px solid #e0e0e0",
                          borderTop: "4px solid #0078d4",
                          borderRadius: "50%",
                          margin: "0 auto 24px",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                    </div>
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: "16px",
                        color: "#0078d4",
                      }}
                    >
                      Importazione in corso
                    </h2>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "16px",
                        color: "#605e5c",
                      }}
                    >
                      {importProgress}
                    </p>
                  </div>
                </div>
              )}

              {currentStep === "import-complete" && (
                <div
                  style={{
                    padding: "24px",
                    height: "100%",
                    overflow: "auto",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 24px",
                    }}
                  >
                    {importResult?.success ? (
                      <>
                        <div
                          style={{
                            fontSize: "48px",
                            marginBottom: "16px",
                            color: "#107c10",
                          }}
                        >
                          ✓
                        </div>
                        <h2
                          style={{
                            marginTop: 0,
                            marginBottom: "8px",
                            color: "#107c10",
                          }}
                        >
                          Importazione completata
                        </h2>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            fontSize: "48px",
                            marginBottom: "16px",
                            color: "#d13438",
                          }}
                        >
                          ✕
                        </div>
                        <h2
                          style={{
                            marginTop: 0,
                            marginBottom: "8px",
                            color: "#d13438",
                          }}
                        >
                          Errore durante l'importazione
                        </h2>
                      </>
                    )}
                    <p
                      style={{
                        margin: "16px 0 24px 0",
                        fontSize: "16px",
                        color: "#605e5c",
                      }}
                    >
                      {importResult?.message}
                    </p>

                    {importResult?.success && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "16px",
                          marginBottom: "24px",
                          padding: "16px",
                          backgroundColor: "#f0f8f4",
                          borderRadius: "4px",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: "#107c10",
                            }}
                          >
                            {importResult.totalRows || "-"}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#605e5c",
                              marginTop: "4px",
                            }}
                          >
                            Righe file
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: "#107c10",
                            }}
                          >
                            {importResult.imported}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#605e5c",
                              marginTop: "4px",
                            }}
                          >
                            Contatti importati
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: "#107c10",
                            }}
                          >
                            {importResult.total}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#605e5c",
                              marginTop: "4px",
                            }}
                          >
                            Contatti totali
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions
              style={{ paddingBottom: "16px", paddingRight: "16px" }}
            >
              {(currentStep === "mapping" ||
                currentStep === "select-mapping" ||
                currentStep === "summary") && (
                <Button appearance="secondary" onClick={handlePreviousStep}>
                  Indietro
                </Button>
              )}

              {currentStep === "file-selection" && (
                <Button
                  appearance="primary"
                  disabled={!selectedFile}
                  onClick={handleNextStep}
                >
                  Avanti
                </Button>
              )}

              {currentStep === "select-mapping" && (
                <Button
                  appearance="primary"
                  onClick={async () => {
                    if (selectedMappingId) {
                      // Carica il mapping selezionato
                      const selectedMapping = availableMappings.find(
                        (m) => m.id === selectedMappingId
                      );
                      if (selectedMapping) {
                        // Carica le regole dal nuovo endpoint
                        const rules = await getMappingRulesByHash(
                          selectedMapping.headerHash
                        );
                        // console.log("Loaded rules from new endpoint:", rules);
                        if (
                          typeof rules === "object" &&
                          Object.keys(rules).length > 0
                        ) {
                          setMapping([rules as Record<string, string>, false]);
                          setMappingName(selectedMapping.name || "");
                          setMappingDescription(
                            selectedMapping.description || ""
                          );
                          setMappingLoaded(true);
                          setCurrentStep("summary");
                        }
                      }
                    } else {
                      // Crea un nuovo mapping
                      handleNextStep();
                    }
                  }}
                >
                  {selectedMappingId ? "Usa mapping" : "Crea nuovo mapping"}
                </Button>
              )}

              {currentStep === "mapping" &&
                currentColumnIndex < fileHeaders.length - 1 && (
                  <Button
                    appearance="primary"
                    onClick={() => setCurrentColumnIndex((i) => i + 1)}
                  >
                    Avanti
                  </Button>
                )}

              {currentStep === "mapping" &&
                fileHeaders.length > 0 &&
                currentColumnIndex === fileHeaders.length - 1 && (
                  <Button
                    appearance="primary"
                    disabled={Object.keys(mapping[0] || {}).length === 0}
                    onClick={() => setCurrentStep("summary")}
                  >
                    Riepilogo
                  </Button>
                )}

              {currentStep === "summary" && (
                <Button
                  appearance="primary"
                  disabled={
                    Object.keys(mapping[0] || {}).length === 0 &&
                    !selectedMappingId
                  }
                  onClick={async () => {
                    if (!selectedFile) return;

                    // Mostra subito la pagina di progresso
                    setCurrentStep("import-progress");
                    setImportProgress("Preparazione importazione...");

                    try {
                      // Frontend validation
                      const fileExtension = selectedFile.name
                        .split(".")
                        .pop()
                        ?.toLowerCase();
                      if (
                        !fileExtension ||
                        !["csv", "vcf"].includes(fileExtension)
                      ) {
                        setImportResult({
                          success: false,
                          imported: 0,
                          total: 0,
                          message:
                            "Formato file non supportato. Usa CSV o VCF.",
                        });
                        setCurrentStep("import-complete");
                        return;
                      }

                      // Read file content for validation
                      const text = await selectedFile.text();

                      // console.log("File content:", text);

                      // Basic validation
                      if (!text || text.trim().length === 0) {
                        setImportResult({
                          success: false,
                          imported: 0,
                          total: 0,
                          message: "Il file è vuoto.",
                        });
                        setCurrentStep("import-complete");
                        return;
                      }

                      // CSV validation: check for basic structure
                      if (fileExtension === "csv") {
                        const lines = text
                          .split("\n")
                          .filter((line) => line.trim());
                        if (lines.length < 2) {
                          setImportResult({
                            success: false,
                            imported: 0,
                            total: 0,
                            message:
                              "Il file CSV deve contenere almeno una riga di intestazione e una riga di dati.",
                          });
                          setCurrentStep("import-complete");
                          return;
                        }
                      }

                      // VCF validation: check for vCard format
                      if (fileExtension === "vcf") {
                        if (
                          !text.includes("BEGIN:VCARD") ||
                          !text.includes("END:VCARD")
                        ) {
                          setImportResult({
                            success: false,
                            imported: 0,
                            total: 0,
                            message:
                              "Il file VCF non contiene un formato vCard valido.",
                          });
                          setCurrentStep("import-complete");
                          return;
                        }
                      }

                      // Save mapping to backend
                      setImportProgress("Salvataggio mappatura...");
                      const normalizedHeaders = fileHeaders;
                      const headersHash =
                        await generateHeadersHash(normalizedHeaders);
                      const maybeMapping = await findOrCreateMapping(
                        normalizedHeaders,
                        headersHash
                      );
                      if (maybeMapping) {
                        setMapping(maybeMapping);
                      }

                      // Persist current mapping before import
                      const saved = await saveMappingToBackend(
                        normalizedHeaders,
                        headersHash,
                        mapping[0]
                      );
                      if (!saved) {
                        setImportResult({
                          success: false,
                          imported: 0,
                          total: 0,
                          message:
                            "Impossibile salvare la mappatura. Correggi e riprova.",
                        });
                        setCurrentStep("import-complete");
                        return;
                      }

                      // Update mapping rules
                      setImportProgress("Aggiornamento regole di mapping...");
                      const rulesUpdated = await updateMappingRules(
                        headersHash,
                        mapping[0]
                      );
                      if (!rulesUpdated) {
                        console.warn("Warning: Failed to update mapping rules");
                      }

                      // Send to backend via API Gateway
                      if (!selectedFile) {
                        setImportResult({
                          success: false,
                          imported: 0,
                          total: 0,
                          message:
                            "Errore: il file non è stato caricato. Seleziona un file e riprova.",
                        });
                        setCurrentStep("import-complete");
                        return;
                      }

                      setImportProgress("Caricamento file in corso...");
                      const formData = new FormData();
                      formData.append("file", selectedFile);
                      formData.append("headerHash", headersHash);
                      formData.append("type", "contact");

                      // console.log("Sending import with:", {
                      //   fileName: selectedFile.name,
                      //   fileSize: selectedFile.size,
                      //   headerHash,
                      //   type: "contacts",
                      // });

                      const baseUrl =
                        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
                        "http://localhost:3000/api";
                      const response = await fetch(
                        `${baseUrl.replace(/\/$/, "")}/v1/imports/contacts`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                          body: formData,
                        }
                      );
                      // console.log("Response status:", response.status);
                      // console.log("Response headers:", response.headers);

                      if (!response.ok) {
                        const contentType =
                          response.headers.get("content-type");
                        let errorMessage = "Errore sconosciuto";

                        try {
                          if (contentType?.includes("application/json")) {
                            const error = await response.json();
                            errorMessage =
                              error.message ||
                              error.error ||
                              JSON.stringify(error);
                          } else {
                            errorMessage = await response.text();
                          }
                        } catch (e) {
                          errorMessage = `Errore HTTP ${response.status}`;
                        }

                        setImportResult({
                          success: false,
                          imported: 0,
                          total: 0,
                          message: `Errore durante l'importazione: ${errorMessage}`,
                        });
                        setCurrentStep("import-complete");
                        return;
                      }

                      setImportProgress("Elaborazione contatti...");
                      const contentType = response.headers.get("content-type");
                      let result;

                      try {
                        if (contentType?.includes("application/json")) {
                          result = await response.json();
                        } else {
                          const text = await response.text();
                          // console.log("Response body:", text);
                          result = text
                            ? JSON.parse(text)
                            : { created: 0, total: 0 };
                        }
                      } catch (e) {
                        console.error("Error parsing response:", e);
                        setImportResult({
                          success: false,
                          imported: 0,
                          total: 0,
                          message:
                            "Errore nel parsing della risposta del server.",
                        });
                        setCurrentStep("import-complete");
                        return;
                      }

                      const imported = result.created || result.imported || 0;
                      const total = result.total || imported;
                      const totalRows = result.totalRows || 0;

                      setImportResult({
                        success: true,
                        imported,
                        total,
                        totalRows,
                        message: `Importazione completata con successo! ${imported} contatti importati.`,
                      });
                      setCurrentStep("import-complete");
                    } catch (error) {
                      console.error("Error importing contacts:", error);
                      setImportResult({
                        success: false,
                        imported: 0,
                        total: 0,
                        message: "Errore durante l'importazione dei contatti.",
                      });
                      setCurrentStep("import-complete");
                    }
                  }}
                >
                  Importa
                </Button>
              )}

              {currentStep === "import-complete" && (
                <Button
                  appearance="primary"
                  onClick={() => {
                    resetDialog();
                    onOpenChange(false);
                  }}
                >
                  Fine
                </Button>
              )}
              <Button
                appearance="secondary"
                onClick={() => {
                  resetDialog();
                  onOpenChange(false);
                }}
              >
                Annulla
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
