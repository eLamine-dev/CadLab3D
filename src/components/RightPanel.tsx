import React, { useState } from "react";
import CreatePanel from "./CreatePanel";
import ModifyPanel from "./ModifyPanel";
import "../styles/RightPanel.css";

const tabs = ["Create", "Modify", "Display"];

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState("Create");

  const renderContent = () => {
    switch (activeTab) {
      case "Create":
        return <CreatePanel />;
      case "Modify":
        return <ModifyPanel />;
      //   case "Display":
      //     return <div>Display options will go here</div>;
      default:
        return null;
    }
  };

  return (
    <div className="right-panel">
      <div className="tab-header">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="panel-content">{renderContent()}</div>
    </div>
  );
}
