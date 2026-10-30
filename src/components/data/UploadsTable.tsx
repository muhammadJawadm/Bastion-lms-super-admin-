import { useState } from "react";
import { Link } from "react-router";
import { FaTrash, FaFile, FaFileVideo, FaFilePdf, FaFileAudio, FaExternalLinkAlt } from "react-icons/fa";
import { api } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatBytes, formatDate, titleCase } from "../../lib/format";
import type { ApiResponse, Upload } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../ui/States";
import { FilterSelect, TableCard, Th, Td, IconButton } from "../ui/PageHeader";

const FOLDERS = ["course-covers", "lesson-media", "form-media", "signatures", "certificates", "avatars", "supporting-media"];

function Thumb({ u }: { u: Upload }) {
  if (u.mimeType?.startsWith("image/")) {
    return <img src={u.url} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-gray-100 object-cover" />;
  }
  const Icon = u.mimeType?.startsWith("video/") ? FaFileVideo
    : u.mimeType?.startsWith("audio/") ? FaFileAudio
    : u.mimeType === "application/pdf" ? FaFilePdf : FaFile;
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400"><Icon size={15} /></div>;
}

interface UploadsTableProps {
  companyId?: string;
  companyNames?: Record<string, string>;
}

export function UploadsTable({ companyId, companyNames = {} }: UploadsTableProps) {
  const [folder, setFolder] = useState("");
  const [toDelete, setToDelete] = useState<Upload | null>(null);
  const { data, loading, error, reload } = useApi<ApiResponse<Upload[]>>("/uploads", { companyId, folder });
  const uploads = data?.data ?? [];
  const totalBytes = uploads.reduce((s, u) => s + (u.sizeBytes ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          value={folder}
          onChange={setFolder}
          options={[{ value: "", label: "All folders" }, ...FOLDERS.map((f) => ({ value: f, label: titleCase(f.replace("-", " ")) }))]}
        />
      </div>

      <TableCard footer={!loading && !error ? `${uploads.length} file${uploads.length === 1 ? "" : "s"} · ${formatBytes(totalBytes)}` : undefined}>
        {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={reload} /> : uploads.length === 0 ? (
          <EmptyBlock label="No uploads found." />
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                <Th>File</Th>
                <Th>Folder</Th>
                {!companyId && <Th>Owner</Th>}
                <Th>Size</Th>
                <Th>Uploaded</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {uploads.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Thumb u={u} />
                      <div className="min-w-0">
                        <p className="max-w-xs truncate font-medium text-gray-900">{u.filename || u.storageKey}</p>
                        <p className="text-xs text-gray-400">{u.mimeType ?? u.resourceType ?? "—"}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge variant="neutral">{u.folder}</Badge></Td>
                  {!companyId && (
                    <Td>
                      {u.companyId ? (
                        <Link to={`/companies/${u.companyId}`} className="text-blue-600 hover:underline">
                          {companyNames[u.companyId] ?? "Unknown company"}
                        </Link>
                      ) : <Badge variant="purple">Bastion</Badge>}
                    </Td>
                  )}
                  <Td className="whitespace-nowrap text-gray-500">{formatBytes(u.sizeBytes)}</Td>
                  <Td className="whitespace-nowrap text-gray-500">{formatDate(u.createdAt)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <a href={u.url} target="_blank" rel="noreferrer" title="Open file" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                        <FaExternalLinkAlt size={11} />
                      </a>
                      <IconButton danger title="Delete upload" onClick={() => setToDelete(u)}><FaTrash size={11} /></IconButton>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <ConfirmDialog
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete upload"
        message={
          <>
            <p>Delete <span className="font-semibold text-gray-800">{toDelete?.filename || toDelete?.storageKey}</span>?</p>
            <p className="mt-2 text-xs text-gray-500">
              The file is removed from Cloudinary. Any course, lesson, form or certificate still pointing at its URL will show a broken link.
            </p>
          </>
        }
        onConfirm={() => api.del(`/uploads/${toDelete!._id}`)}
        onDone={reload}
      />
    </div>
  );
}
