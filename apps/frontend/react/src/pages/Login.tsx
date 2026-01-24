import {
  Button,
  Card,
  Input,
  Label,
  Text,
  Title3,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    marginBottom: "24px",
    textAlign: "center",
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
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "12px",
    marginTop: "4px",
  },
  button: {
    marginTop: "8px",
  },
});

export default function Login() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl =
        (import.meta as any).env?.API_GATEWAY_BASE_URL ||
        "http://localhost:3000/api";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            email,
            password,
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
      console.log("Login data:", data);

      // Salva il token nel localStorage
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);

        // Salva anche altre informazioni utili se presenti
        if (data.refresh_token) {
          localStorage.setItem("refreshToken", data.refresh_token);
        }
        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }

        // Redirect alla dashboard
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
        <Title3 className={styles.title}>Accedi a Dike</Title3>
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
              placeholder="nome@esempio.com"
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
      </Card>
    </div>
  );
}
