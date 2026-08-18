import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Toggle } from "../components/ui/Toggle";
import { Modal, FieldLabel, FieldSelect, ModalBtn } from "../components/ui/Modal";
import { COURSE_CATEGORIES, TEMPLATE_CATEGORIES } from "../data/catalog";
import { COMPANIES } from "../data/companies";
import {
  FaSearch, FaTrash, FaQrcode, FaUpload, FaDownload, FaCheckCircle,
  FaFilePdf, FaFileImage, FaCertificate, FaStar, FaBuilding, FaLayerGroup,
} from "react-icons/fa";

interface CertificateFile {
  id: number;
  fileName: string;
  fileType: "pdf" | "image";
  scope: string;
  scopeType: "all" | "client" | "category";
  qrEnabled: boolean;
  isDefault: boolean;
  uploadedDate: string;
}

const CERTIFICATES: CertificateFile[] = [
  { id: 1, fileName: "Standard-Bastion-Certificate.pdf",   fileType: "pdf",   scope: "All Clients",                   scopeType: "all",      qrEnabled: true,  isDefault: true,  uploadedDate: "04 Jan 2025" },
  { id: 2, fileName: "Titan-Steel-Branded-Cert.pdf",       fileType: "pdf",   scope: COMPANIES[0].name,               scopeType: "client",   qrEnabled: true,  isDefault: false, uploadedDate: "22 Jan 2024" },
  { id: 3, fileName: "Beacon-Energy-Certificate.png",      fileType: "image", scope: COMPANIES[6].name,               scopeType: "client",   qrEnabled: true,  isDefault: false, uploadedDate: "30 Jul 2023" },
  { id: 4, fileName: "Excavation-Competent-Person.pdf",    fileType: "pdf",   scope: "Excavation & Trenching",        scopeType: "category", qrEnabled: false, isDefault: false, uploadedDate: "11 Feb 2025" },
  { id: 5, fileName: "Vanguard-Pipeline-Cert.pdf",         fileType: "pdf",   scope: COMPANIES[8].name,               scopeType: "client",   qrEnabled: true,  isDefault: false, uploadedDate: "19 Mar 2025" },
  { id: 6, fileName: "Confined-Space-Entry-Cert.png",      fileType: "image", scope: "Confined Space",                scopeType: "category", qrEnabled: true,  isDefault: false, uploadedDate: "02 May 2025" },
];

const scopeBadge = (t: CertificateFile["scopeType"]): "info" | "purple" | "orange" =>
  t === "all" ? "info" : t === "client" ? "purple" : "orange";

const scopeIcon = (t: CertificateFile["scopeType"]) =>
  t === "all" ? FaLayerGroup : t === "client" ? FaBuilding : FaCertificate;

function UploadCertificateContent() {
  const [qr, setQr] = useState(true);
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-10 text-center hover:border-blue-300 transition-colors cursor-pointer">
        <FaUpload size={20} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-600">Drop a PDF or image file, or click to browse</p>
        <p className="text-xs text-gray-400">Used as the printable certificate layout — no in-app editor required</p>
      </div>
      <div>
        <FieldLabel>Applies To</FieldLabel>
        <FieldSelect>
          <option>All Clients</option>
          <optgroup label="Specific Client">
            {COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}
          </optgroup>
          <optgroup label="Course / Template Category">
            {[...COURSE_CATEGORIES, ...TEMPLATE_CATEGORIES].map((c) => <option key={c}>{c}</option>)}
          </optgroup>
        </FieldSelect>
      </div>
      <Toggle checked={qr} onChange={setQr} label="Include QR verification code" sublabel="Lets a GC or auditor confirm the certificate is genuine" />
    </div>
  );
}

function CertificateCard({ cert }: { cert: CertificateFile }) {
  const ScopeIcon = scopeIcon(cert.scopeType);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {cert.isDefault && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
          <FaStar size={9} /> Default
        </div>
      )}
      <div className="flex h-28 items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {cert.fileType === "pdf"
            ? <FaFilePdf size={22} className="text-red-500" />
            : <FaFileImage size={22} className="text-indigo-500" />}
        </div>
      </div>
      <div className="p-4">
        <p className="truncate text-sm font-semibold text-gray-900" title={cert.fileName}>{cert.fileName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge variant={scopeBadge(cert.scopeType)}>
            <span className="flex items-center gap-1"><ScopeIcon size={9} /> {cert.scope}</span>
          </Badge>
          {cert.qrEnabled && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
              <FaQrcode size={9} /> QR
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400">Uploaded {cert.uploadedDate}</p>
      </div>
      <div className="flex items-center gap-1 border-t border-gray-100 px-2 py-2">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
          <FaDownload size={10} /> Download
        </button>
        {!cert.isDefault && (
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            <FaStar size={10} /> Set Default
          </button>
        )}
        <button className="flex items-center justify-center rounded-lg px-2.5 py-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
          <FaTrash size={11} />
        </button>
      </div>
    </div>
  );
}

export default function Certificates() {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = CERTIFICATES.filter(
    (c) => c.fileName.toLowerCase().includes(search.toLowerCase()) || c.scope.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Manager</h1>
          <p className="mt-1 text-sm text-gray-500">Upload the certificate layouts issued after course completion — no in-app designer, just the files.</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <FaUpload size={12} /> Upload Certificate
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Certificates", value: CERTIFICATES.length,                                  icon: FaCertificate, bg: "bg-blue-50",   color: "text-blue-600"   },
          { label: "QR-Verified",        value: CERTIFICATES.filter((c) => c.qrEnabled).length,        icon: FaQrcode,      bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Client-Branded",     value: CERTIFICATES.filter((c) => c.scopeType === "client").length, icon: FaBuilding, bg: "bg-purple-50", color: "text-purple-600" },
          { label: "Category-Specific",  value: CERTIFICATES.filter((c) => c.scopeType === "category").length, icon: FaLayerGroup, bg: "bg-orange-50", color: "text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon size={14} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm sm:max-w-sm">
        <FaSearch size={13} className="shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Search by file name or scope..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <FaCertificate size={24} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm text-gray-400">No certificates match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => <CertificateCard key={c.id} cert={c} />)}
        </div>
      )}

      <Modal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Certificate"
        footer={
          <>
            <ModalBtn variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</ModalBtn>
            <ModalBtn variant="primary" onClick={() => setUploadOpen(false)}><FaCheckCircle size={11} className="inline mr-1.5 -mt-0.5" />Upload</ModalBtn>
          </>
        }
      >
        <UploadCertificateContent />
      </Modal>
    </div>
  );
}
