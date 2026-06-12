import { useRef } from "react";
import { PDFDocument } from "pdf-lib";

function PdfSplitter() {
    const fileInputRef = useRef(null);

    async function getFilenameFromOCR(pdfBytes) {
        const formData = new FormData();

        const blob = new Blob([pdfBytes], {
            type: "application/pdf"
        });

        formData.append("pdf", blob, "document.pdf");

        const response = await fetch("http://localhost:8000/ocr", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("OCR request failed");
        }

        const data = await response.json();

        return data.filename;
    }

    async function splitPdf() {
        const file = fileInputRef.current.files[0];

        if (!file) {
            alert("Select a PDF first");
            return;
        }

        const pdfBytes = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(pdfBytes);

        const pageCount = sourcePdf.getPageCount();

        const folderHandle = await window.showDirectoryPicker();

        let fileNumber = 1;

        function sanitizeFilename(name) {
            if (!name) return null;
            // remove control chars and characters invalid on Windows
            let s = name.replace(/[<>:\"/\\|?*\x00-\x1F]/g, "");
            // replace newlines with space and collapse whitespace
            s = s.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
            // remove trailing dots/spaces
            s = s.replace(/[.\s]+$/g, "");
            return s || null;
        }

        for (let i = 0; i < pageCount; i += 2) {
            try {
                const newPdf = await PDFDocument.create();

                const pages = await newPdf.copyPages(
                    sourcePdf,
                    [i, i + 1].filter(p => p < pageCount)
                );

                pages.forEach(page => newPdf.addPage(page));

                const outputBytes = await newPdf.save();

                let filename;

                try {
                    const raw = await getFilenameFromOCR(outputBytes);
                    console.log("OCR returned filename for chunk", fileNumber, ":", raw);
                    filename = sanitizeFilename(raw) || `Document ${fileNumber}`;
                }
                catch (error) {
                    console.error("OCR failed for chunk", fileNumber, error);
                    filename = `Document ${fileNumber}`;
                }

                const fileHandle = await folderHandle.getFileHandle(
                    `${filename}.pdf`,
                    { create: true }
                );
                const writable = await fileHandle.createWritable();

                await writable.write(outputBytes);
                await writable.close();

                fileNumber++;
            }
            catch (error) {
                console.error("Failed to save chunk", fileNumber, error);
                // continue on error so later pages still attempt to save
                fileNumber++;
                continue;
            }
        }

        alert("Finished");
    }

    return (
        <>
            <h2>Split PDF into 2-page files</h2>

            <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
            />

            <br />
            <br />

            <button onClick={splitPdf}>
                Split PDF
            </button>
        </>
    );
}

export default PdfSplitter;