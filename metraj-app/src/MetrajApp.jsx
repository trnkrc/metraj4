import React, { useState } from "react";
import * as XLSX from "xlsx";

function parseSequence(seq) {
  if (!seq) return [];
  return seq
    .replace(/→|—|–|-->/g, " ")
    .replace(/[,;]/g, " ")
    .split(/\s+/)
    .filter((v) => v.length);
}

const COLUMNS = [
  { key: "start", label: "Başlangıç Baca" },
  { key: "end", label: "Bitiş Baca" },
  { key: "mesafe", label: "Mesafe (m)" },
  { key: "boru", label: "Boru Çapı" },
  { key: "bz", label: "Başlangıç Zemin" },
  { key: "bg", label: "Başlangıç Giriş" },
  { key: "bc", label: "Başlangıç Çıkış" },
  { key: "ez", label: "Bitiş Zemin" },
  { key: "eg", label: "Bitiş Giriş" },
  { key: "ec", label: "Bitiş Çıkış" },
  { key: "hat", label: "Hat" },
];

export default function MetrajApp() {
  const [pdfFile, setPdfFile] = useState(null);
  const [mainHat, setMainHat] = useState("");
  const [kilciks, setKilciks] = useState([""]);
  const [rows, setRows] = useState([]);

  const handleKilcikChange = (idx, val) => {
    const clone = [...kilciks];
    clone[idx] = val;
    setKilciks(clone);
  };

  const addKilcik = () => setKilciks([...kilciks, ""]);
  const removeKilcik = (idx) => setKilciks(kilciks.filter((_, i) => i !== idx));

  const handleGenerate = () => {
    const newRows = [];
    const seq = parseSequence(mainHat);
    for (let i = 0; i < seq.length - 1; i++) {
      newRows.push({
        start: seq[i],
        end: seq[i + 1],
        mesafe: "",
        boru: "",
        bz: "",
        bg: "",
        bc: "",
        ez: "",
        eg: "",
        ec: "",
        hat: "ANA HAT",
      });
    }
    kilciks.forEach((k, index) => {
      const parts = parseSequence(k);
      for (let i = 0; i < parts.length - 1; i++) {
        newRows.push({
          start: parts[i],
          end: parts[i + 1],
          mesafe: "",
          boru: "",
          bz: "",
          bg: "",
          bc: "",
          ez: "",
          eg: "",
          ec: "",
          hat: `KILÇIK ${index + 1}`,
        });
      }
    });
    setRows(newRows);
  };

  const handleCellChange = (idx, key, value) => {
    const clone = [...rows];
    clone[idx][key] = value;
    setRows(clone);
  };

  const exportExcel = () => {
    if (!rows.length) return;
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Metraj");
    XLSX.writeFile(workbook, "metraj_cetveli.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>PDF / DWG Yükle</h2>
      <input type="file" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
      <br /><br />
      <h2>ANA HAT</h2>
      <textarea value={mainHat} onChange={(e) => setMainHat(e.target.value)} />
      <br />
      <h2>KILÇIKLAR</h2>
      {kilciks.map((k, idx) => (
        <div key={idx}>
          <textarea value={k} onChange={(e) => handleKilcikChange(idx, e.target.value)} />
          <button onClick={() => removeKilcik(idx)}>Sil</button>
        </div>
      ))}
      <button onClick={addKilcik}>+ Ekle</button>
      <br /><br />
      <button onClick={handleGenerate}>Metraj Tablosu Oluştur</button>
      <button onClick={exportExcel}>Excel İndir</button>
      <br /><br />
      <table border="1">
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {COLUMNS.map((c) => (
                <td key={c.key}>
                  {c.key === "start" || c.key === "end" || c.key === "hat" ? (
                    row[c.key]
                  ) : (
                    <input
                      value={row[c.key]}
                      onChange={(e) => handleCellChange(rIdx, c.key, e.target.value)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
