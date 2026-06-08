import { useState } from "react";
import "./styles.css";

function DGFormatter() {
    // REGION MAPPING
    const areaMap = {
        // Wairarapa
        "masterton":"WWP 50474260",
        "lansdowne":"WWP 50474260",
        "carterton":"WWP 50474260",
        "greytown":"WWP 50474260",
        "featherston":"WWP 50474260",
        "martinborough":"WWP 50474260",
        "eketahuna":"WWP 50474260",

        // Manawatu
        "palmerston north":"WMA 50474259",
        "feilding":"WMA 50474259",
        "ashhurst":"WMA 50474259",
        "bunnythorpe":"WMA 50474259",
        "woodville":"WMA 50474259",
        "foxton":"WMA 50474259",
        "tangimomana":"WMA 50474259",
        "aokautere":"WMA 50474259",
        "cheltenham":"WMA 50474259",

        // Whanganui
        "whanganui":"WWG 50474262",
        "wanganui":"WWG 50474262",
        "marton":"WWG 50474262",
        "taihape":"WWG 50474262",
        "bulls":"WWG 50474262",
        "ohakune":"WWG 50474262",
        "brunswick":"WWG 50474262",
        "hunterville":"WMA 50474259",
    };

    const [input, setInput] = useState("");

    const [output, setOutput] = useState({request: "", icp: "", address: "", region: ""});

    function findRegion(address) {
        const lowerAddress = address.toLowerCase();
        const sortedAreas = Object.keys(areaMap).sort((a, b) => b.length - a.length);

        for (const area of sortedAreas) {
            if (lowerAddress.includes(area)) {return areaMap[area];}
        }
        return "UNKNOWN";
    }

    function formatText(textValue) {
        let text = textValue.trim();
        let parts = text.split(" - ");

        if (parts.length < 4) {
            alert("Input format not recognised");
            return;
        }

        let request = parts[1].trim();
        let icp = parts[2].trim();
        let address = parts[3].replace(/\s+,/g, ",").trim();
        let region = findRegion(address);

        setOutput({request, icp, address, region});
        setInput("");
    }

    function handlePaste(e) {
        const pastedText = e.clipboardData.getData("text");
        setTimeout(() => {formatText(pastedText);}, 10);
    }

    async function copyOutput() {
        const outputHtml =
            `<div>DG Labelling request - ${output.request} - ICP ${output.icp}</div>
            <div><strong>${output.address}</strong></div>
            <div>${output.region}</div>`;

        const outputText =
            `DG Labelling request - ${output.request} - ICP ${output.icp}
            ${output.address}
            ${output.region}`;

        await navigator.clipboard.write([
            new ClipboardItem({
                "text/html": new Blob(
                    [outputHtml],
                    { type: "text/html" }
                ),
                "text/plain": new Blob(
                    [outputText],
                    { type: "text/plain" }
                )
            })
        ]);
    }

    return (
        <>
            <div className="titleAndButton">
                <div>
                    <h1>DG Email subject to Job Card Format</h1>
                </div>
            </div>

            <textarea
                placeholder="Enter email subject"
                value={input}
                onChange={(e) => {
                    const value = e.target.value;
                    setInput(value);
                    if (value.trim()) {formatText(value);}
                }}
            />

            <div className="centered-buttons-div">
                <button onClick={copyOutput}>Copy Output</button>
            </div>

            <div className="output">
                {output.request && (
                    <>
                        <div>DG Labelling request - {output.request} - ICP {output.icp}</div>
                        <strong>{output.address}</strong>
                        <br />
                        <div>{output.region}</div>
                    </>
                )}
            </div>
        </>
    );
}

export default DGFormatter;