function Workspace() {
  const [activeView, setActiveView] = useState("Perspective");
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyW") {
        setMaximized((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`viewports-container ${maximized ? "maximized" : ""}`}>
      <div className="controls">
        <label>Camera View: </label>
        <select
          onChange={(e) => setActiveView(e.target.value)}
          value={activeView}
        >
          <option value="Perspective">Perspective</option>
          <option value="Top">Top</option>
          <option value="Front">Front</option>
          <option value="Left">Left</option>
        </select>
      </div>
      <div className="viewports">
        <Viewport
          cameraType={activeView}
          controls={activeView === "Perspective"}
        />
      </div>
    </div>
  );
}
