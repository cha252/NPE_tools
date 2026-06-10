import { useState } from "react";

import DGFormatter from "./src/components/DGFormatter";
import PdfSplitter from "./src/components/PdfSplitter";
import GWFormatter from "./src/components/GWFormatter";
import NRFormatter from "./src/components/NRFormatter";

import "./App.css";

function App() {
    const [selectedTool, setSelectedTool] = useState("dg");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    function renderTool() {
        switch (selectedTool) {
            case "gw":
                return <GWFormatter />;

            case "nr":
                return <NRFormatter />;

            case "pdf":
                return <PdfSplitter />;

            case "dg":
            default:
                return <DGFormatter />;
        }
    }

    return (
        <div className="layout">
            <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <button
                    className="toggle-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <div>☰</div>
                </button>

                {sidebarOpen && (
                    <>
                        <button onClick={() => setSelectedTool("dg")}>
                            DG Formatter
                        </button>

                        <button onClick={() => setSelectedTool("pdf")}>
                            PDF Splitter
                        </button>

                        <button onClick={() => setSelectedTool("gw")}>
                            GW Formatter
                        </button>

                        <button onClick={() => setSelectedTool("nr")}>
                            NR Formatter
                        </button>
                    </>
                )}
            </aside>

            <main className="content">
                {renderTool()}
            </main>
        </div>
    );
}

export default App;