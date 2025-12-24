import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    // Handle window resize
    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Bubble class
    class Bubble {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * W;
        this.y = H + Math.random() * 200;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(1 + Math.random() * 1.5);
        this.r = 6 + Math.random() * 24;
        this.opacity = 0.1 + Math.random() * 0.1;
      }

      step() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -100) this.reset();
      }

      draw() {
        ctx.beginPath();
        const g = ctx.createLinearGradient(
          this.x - this.r,
          this.y - this.r,
          this.x + this.r,
          this.y + this.r
        );
        g.addColorStop(0, `rgba(142, 240, 255, ${this.opacity})`);
        g.addColorStop(1, `rgba(123, 97, 255, ${this.opacity * 0.9})`);
        ctx.fillStyle = g;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(123, 97, 255, 0.3)";
        ctx.ellipse(this.x, this.y, this.r, this.r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const bubbles = Array.from({ length: 50 }, () => new Bubble());

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      for (const b of bubbles) {
        b.step();
        b.draw();
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Burst effect on click
  const handleBurst = (e) => {
    const x = e.clientX;
    const y = e.clientY;

    for (let i = 0; i < 20; i++) {
      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = el.style.height = 6 + Math.random() * 12 + "px";
      el.style.borderRadius = "50%";
      el.style.background = Math.random() < 0.5 ? "#8ef0ff" : "#7b61ff";
      el.style.pointerEvents = "none";
      el.style.opacity = "1";
      el.style.zIndex = "999";
      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 100;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      el.animate(
        [
          { transform: "translate(0,0) scale(0.8)", opacity: 1 },
          {
            transform: `translate(${dx}px,${dy}px) scale(1.2)`,
            opacity: 0,
          },
        ],
        {
          duration: 700 + Math.random() * 400,
          easing: "ease-out",
        }
      ).onfinish = () => el.remove();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleBurst);
    return () => document.removeEventListener("click", handleBurst);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        background: "linear-gradient(180deg, #0f1724, #071028)",
        color: "#e6eef6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
      onClick={handleBurst}
    >
      {/* Bubble canvas background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Container */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          maxWidth: "600px",
          padding: "40px",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(8px)",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(2, 6, 23, 0.7)",
        }}
      >
        {/* 404 Code with neon effect */}
        <div
          style={{
            fontSize: "100px",
            fontWeight: 800,
            color: "transparent",
            WebkitTextStroke: "2px rgba(170, 200, 255, 0.2)",
            position: "relative",
            background: "linear-gradient(90deg, #8ef0ff, #7b61ff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            animation: "neon 2s ease-in-out forwards",
          }}
        >
          404
          <style>{`
            @keyframes neon {
              0% {
                opacity: 0;
                filter: blur(10px);
              }
              100% {
                opacity: 1;
                filter: blur(0);
              }
            }
          `}</style>
        </div>

        {/* Heading */}
        <h2
          style={{
            marginTop: "20px",
            color: "#dff6ff",
            fontSize: "24px",
            fontWeight: 600,
            margin: "20px 0 10px 0",
          }}
        >
          Page Not Found
        </h2>

        {/* Description */}
        <p
          style={{
            marginTop: "10px",
            color: "#9aa7b2",
            margin: "10px 0 30px 0",
          }}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Action buttons */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background: "linear-gradient(90deg, #8ef0ff, #7b61ff)",
              color: "#021029",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.target.style.transform = "scale(1)")
            }
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              background: "transparent",
              color: "#8ef0ff",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.target.style.transform = "scale(1)")
            }
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
