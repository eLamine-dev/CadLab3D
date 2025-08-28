import { useMetaStore } from "../state/metaStore";
// import { useCreate } from "../hooks/useCreate";

export default function ModifySelected({ subLevels }: { subLevels: string[] }) {
  return (
    <div className="modify-polyline">
      <h3>Modification</h3>
      <label>
        <input
          type="radio"
          name="modification-level"
          value="top"
          defaultChecked={true}
        />
        Top
      </label>

      {subLevels.map((level) => (
        <>
          <br />
          <label>
            <input type="radio" name="modification-level" value={level} />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </label>
        </>
      ))}
    </div>
  );
}
