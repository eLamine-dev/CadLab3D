import { useMetaStore } from "../state/metaStore";
// import { useCreate } from "../hooks/useCreate";

export default function ModifyPolyline() {
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
      <br />
      <label>
        <input type="radio" name="modification-level" value="vertex" />
        Vertex
      </label>
      <br />
      <label>
        <input type="radio" name="modification-level" value="segment" />
        Segment
      </label>
    </div>
  );
}
