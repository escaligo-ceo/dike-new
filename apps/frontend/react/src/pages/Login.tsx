import {
  Button,
  Card,
  Input,
  Label,
  Text,
  Title3,
  Checkbox,
  Link,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_DIKE_CLOUD_HOST } from "../config/api";

const useStyles = makeStyles({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground3,
  },
  card: {
    width: "400px",
    padding: "32px",
  },
  title: {
    marginBottom: "4px",
    textAlign: "center",
  },
  subtitle: {
    marginBottom: "24px",
    textAlign: "center",
    display: "block",
    color: tokens.colorNeutralForeground3,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "-4px",
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "12px",
    marginTop: "4px",
  },
  button: {
    marginTop: "8px",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: "16px",
  },
  linkSemibold: {
    fontWeight: tokens.fontWeightSemibold,
  },
});

export default function Login() {
  const styles = useStyles();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_DIKE_CLOUD_HOST.baseUrl.replace(/\/$/, "")}/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            rememberMe,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Login fallito");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
        if (data.userId) localStorage.setItem("userId", data.userId);

        navigate("/dashboard");
      } else {
        setError("Token non ricevuto dal server");
      }
    } catch (err) {
      console.error("Errore durante il login:", err);
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title3 className={styles.title}>Dike.cloud</Title3>
        <Text className={styles.subtitle}>La tua professione in ordine</Text>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@studiolegale.it"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.optionsRow}>
            <Checkbox
              label="Ricordami"
              checked={rememberMe}
              onChange={(_, data) => setRememberMe(!!data.checked)}
              disabled={loading}
            />
            <Link 
              onClick={() => navigate("/recupera-password")} 
              style={{ fontSize: '12px' }}
            >
              Password dimenticata?
            </Link>
          </div>

          {error && <Text className={styles.error}>{error}</Text>}

          <Button
            className={styles.button}
            appearance="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>

        <div className={styles.footer}>
          <Text size={200}>Non hai un account?</Text>{" "}
          <Link 
            className={styles.linkSemibold} 
            onClick={() => navigate("/registrati")}
          >
            Registrati ora
          </Link>
        </div>
      </Card>
    </div>
  );
}