import { useMetaStore } from "../state/metaStore";
// import { useCreate } from "../hooks/useCreate";
import ModifyPolyline from "./ModifyPolyline";

export default function ModifyPanel() {
  // useCreate();
  const { setMode } = useMetaStore();

  const tools = ["extrude", "boolean"];

  return (
    <div className="modify-panel">
      <h3>Create Object</h3>
      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => {
            setMode("modify", tool);
          }}
        >
          {tool}
        </button>
      ))}
      <ModifyPolyline />
    </div>
  );
}
