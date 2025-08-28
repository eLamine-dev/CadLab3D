import { useMetaStore } from "../state/metaStore";
import { useSelectionStore } from "../state/selectionStore";
// import { useCreate } from "../hooks/useCreate";
import ModifyPolyline from "./ModifySelected";

export default function ModifyPanel() {
  // useCreate();
  const { setMode } = useMetaStore();
  const { selected } = useSelectionStore();

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
      {selected.length > 0 && (
        <div>Selected: {selected[0].userData.subLevels}</div>
      )}

      {selected.length === 1 && selected[0].userData.subLevels && (
        <ModifyPolyline subLevels={selected[0].userData.subLevels} />
      )}
    </div>
  );
}
