import { useMetaStore } from "../state/metaStore";
// import { useCreate } from "../hooks/useCreate";

export default function ModifyPanel() {
  // useCreate();
  const { setMode } = useMetaStore();

  const tools = ["extrude", "boolean"];

  return (
    <div className="create-panel">
      <h3>Create Object</h3>
      {tools.map((obj) => (
        <button
          key={obj}
          onClick={() => {
            setMode("modify", obj);
          }}
        >
          {obj}
        </button>
      ))}
    </div>
  );
}
