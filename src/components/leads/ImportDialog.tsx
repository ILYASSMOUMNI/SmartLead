import { useRef, useState } from "react";
import { Download, FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { leadService } from "../../services";
import { useApp } from "../../hooks/useApp";
import { Button } from "../ui/button";
import { Modal, Notice } from "../ui/shared";
export function ImportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { refresh, notify } = useApp();
  async function upload() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (!file.name.toLowerCase().endsWith(".csv"))
        throw new Error("Choose a .csv file.");
      if (file.size > 2 * 1024 * 1024)
        throw new Error("The file must be smaller than 2 MB.");
      const count = await leadService.importCSV(await file.text());
      await refresh();
      notify(`${count} leads imported successfully.`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bring your leads together"
      description="Import a CSV file and turn new connections into opportunities."
    >
      <button className="upload-zone" onClick={() => input.current?.click()}>
        <span>
          <FileSpreadsheet size={28} />
        </span>
        <strong>{file ? file.name : "Click to choose a CSV file"}</strong>
        <p>Up to 500 leads · Maximum 2 MB</p>
      </button>
      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label="Choose CSV file"
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setError("");
        }}
      />
      <p className="import-columns">
        Required columns: <code>firstName, lastName, email, company</code>.
        Optional engagement fields generate a deterministic Demo AI Score.
      </p>
      <a className="text-link" href="/example-leads.csv" download>
        <Download size={15} /> Download example CSV
      </a>
      <Notice>
        All rows are validated before anything is imported. Duplicate emails are
        rejected. Consent defaults to false.
      </Notice>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!file || busy} onClick={() => void upload()}>
          {busy ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Upload size={16} />
          )}
          Import leads
        </Button>
      </div>
    </Modal>
  );
}
