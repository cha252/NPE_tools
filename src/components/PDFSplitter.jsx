import { useRef } from "react";
import { PDFDocument } from "pdf-lib";

function PdfSplitter() {
    const fileInputRef = useRef(null);

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

        for (let i = 0; i < pageCount; i += 2) {
            const newPdf = await PDFDocument.create();

            const pages = await newPdf.copyPages(
                sourcePdf,
                [i, i + 1].filter(p => p < pageCount)
            );

            pages.forEach(page => newPdf.addPage(page));

            const outputBytes = await newPdf.save();

            const fileHandle = await folderHandle.getFileHandle(
                `Document ${fileNumber}.pdf`,
                { create: true }
            );

            const writable = await fileHandle.createWritable();

            await writable.write(outputBytes);
            await writable.close();

            fileNumber++;
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