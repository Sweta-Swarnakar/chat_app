import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import chatLogo from "../icons/chat.png";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { readJsonResponse } from "../utils/api";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const authUrl = isSignUp ? `${API_URL}/api/auth/register` : `${API_URL}/api/auth/login`;

  const handleAuth = async (event) => {
    event.preventDefault();
    setError("");

    const body = isSignUp
      ? { name, email, password }
      : { email, password };

    try {
      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        const message = data.message || "Authentication failed";
        setError(
          message === "Invalid credentials"
            ? "Invalid credentials. Please check your email/password or sign up first."
            : message
        );
        return;
      }

      localStorage.setItem("chatAppToken", data.accessToken);

      navigate("/app/welcome");
    } catch (err) {
      setError("Unable to connect to the server");
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img src={chatLogo} alt="chat logo" className="welcome-logo" />
      </div>
      <div className="login-box">
        <p className="login-banner">{isSignUp ? "Create your account" : "Login to your account"}</p>
        {error && <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>}
        <form onSubmit={handleAuth}>
          {isSignUp && (
            <TextField
              id="outlined-name-input"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          )}
          <TextField
            id="outlined-email-input"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            id="outlined-password-input"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" fullWidth style={{ marginTop: 16 }}>
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
        </form>
        <Button
          variant="text"
          fullWidth
          style={{ marginTop: 12 }}
          onClick={() => {
            setIsSignUp((prev) => !prev);
            setError("");
          }}
        >
          {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
        </Button>
      </div>
    </div>
  );
}
