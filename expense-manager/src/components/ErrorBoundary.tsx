import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}>
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "480px",
          }}>
            <h2 style={{ margin: "0 0 0.5rem", color: "#dc2626", fontSize: "1.25rem" }}>
              Đã xảy ra lỗi
            </h2>
            <p style={{ margin: "0 0 1rem", color: "#71717a", fontSize: "0.875rem" }}>
              Ứng dụng gặp sự cố. Hãy thử tải lại trang.
            </p>
            <pre style={{
              background: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              padding: "0.75rem",
              fontSize: "0.75rem",
              color: "#ef4444",
              overflow: "auto",
              maxHeight: "120px",
              textAlign: "left",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {this.state.error?.message || "Unknown error"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
