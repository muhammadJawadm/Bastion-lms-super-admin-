import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Modal, FieldLabel, FieldInput, FieldSelect, ModalBtn } from "../components/ui/Modal";
import { COMPANIES } from "../data/companies";
import { FaPlus, FaGraduationCap, FaClipboardList, FaTrash, FaBolt } from "react-icons/fa";

interface Assignment {
  id: number;
  content: string;
  type: "Course" | "Template";
  target: string;
  scope: "Company" | "Site" | "Role" | "Individual";
  dueRule: string;
  recurrence: string;
  required: boolean;
}

const ASSIGNMENTS: Assignment[] = [
  { id: 1, content: "Job Hazard Analysis (JHA)",           type: "Template", target: "All Companies",                       scope: "Company",    dueRule: "Before each task", recurrence: "Per shift",  required: true  },
  { id: 2, content: "Excavation Safety Fundamentals",       type: "Course",   target: `${COMPANIES[0].name} — Excavation Foreman`, scope: "Role",  dueRule: "14 days from assignment", recurrence: "Annually", required: true },
  { id: 3, content: "Trench & Excavation Inspection",       type: "Template", target: `${COMPANIES[1].name} — Savannah Trench Site`, scope: "Site", dueRule: "Start of each shift", recurrence: "Per shift", required: true },
  { id: 4, content: "Equipment Pre-Use Inspection",         type: "Template", target: "All Companies",                       scope: "Company",    dueRule: "Before each use",  recurrence: "Before each use", required: true },
  { id: 5, content: "Fall Protection Basics",                type: "Course",   target: `${COMPANIES[4].name}`,                scope: "Company",    dueRule: "30 days from assignment", recurrence: "Every 12 months", required: true },
  { id: 6, content: "Toolbox Talk Sign-In",                  type: "Template", target: "All Companies",                       scope: "Company",    dueRule: "Weekly",           recurrence: "Weekly", required: false },
  { id: 7, content: "Confined Space Awareness",              type: "Course",   target: `${COMPANIES[6].name} — Field Technician`, scope: "Role",  dueRule: "7 days from assignment",  recurrence: "Every 24 months", required: true },
];

const AUTO_RULES = [
  { id: 1, trigger: "New user with job title \"Excavation Foreman\"", assigns: "Trench Inspection Report + Excavation Safety Fundamentals", active: true },
  { id: 2, trigger: "New user with job title \"Confined Space Entrant\"", assigns: "Confined Space Entry Permit + Confined Space Awareness", active: true },
  { id: 3, trigger: "New company on Enterprise plan", assigns: "General Orientation + Daily Jobsite Audit", active: false },
];

function AssignContent() {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Course or Template</FieldLabel>
        <FieldSelect>
          <optgroup label="Courses"><option>Excavation Safety Fundamentals</option><option>Fall Protection Basics</option></optgroup>
          <optgroup label="Templates"><option>Job Hazard Analysis (JHA)</option><option>Daily Jobsite Audit</option></optgroup>
        </FieldSelect>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Assign To</FieldLabel>
          <FieldSelect><option>Company</option><option>Site</option><option>Job Role</option><option>Specific Individuals</option></FieldSelect>
        </div>
        <div>
          <FieldLabel>Company</FieldLabel>
          <FieldSelect>{COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}</FieldSelect>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><FieldLabel>Due</FieldLabel><FieldInput placeholder="e.g. 14 days from assignment" /></div>
        <div>
          <FieldLabel>Recurrence</FieldLabel>
          <FieldSelect><option>One-time</option><option>Per shift</option><option>Daily</option><option>Weekly</option><option>Annually</option><option>Custom cycle</option></FieldSelect>
        </div>
      </div>
      <label className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3.5 py-2.5">
        <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" />
        <span className="text-sm text-gray-700">Required before work can begin</span>
      </label>
    </div>
  );
}

export default function Assignments() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">Courses and templates assigned to companies, sites, roles and individuals.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={12} /> New Assignment
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {["Content", "Target", "Scope", "Due", "Recurrence", "Required", ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ASSIGNMENTS.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.type === "Course" ? "bg-blue-50" : "bg-purple-50"}`}>
                        {a.type === "Course" ? <FaGraduationCap size={12} className="text-blue-600" /> : <FaClipboardList size={12} className="text-purple-600" />}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{a.content}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.target}</td>
                  <td className="px-5 py-3.5"><Badge variant="neutral">{a.scope}</Badge></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{a.dueRule}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500">{a.recurrence}</td>
                  <td className="px-5 py-3.5">{a.required ? <Badge variant="warning">Required</Badge> : <span className="text-xs text-gray-300">Optional</span>}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">Extend</button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><FaTrash size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <FaBolt size={13} className="text-yellow-500" />
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Auto-Assign Rules</h2>
            <p className="text-xs text-gray-400">Automatically assign training when a matching account is activated.</p>
          </div>
        </div>
        <ul className="divide-y divide-gray-50">
          {AUTO_RULES.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm text-gray-800">
                  When <span className="font-medium">{r.trigger}</span>
                </p>
                <p className="mt-0.5 text-xs text-gray-400">assign: {r.assigns}</p>
              </div>
              <Badge variant={r.active ? "success" : "neutral"}>{r.active ? "Active" : "Paused"}</Badge>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 px-5 py-3">
          <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            <FaPlus size={10} /> Add Rule
          </button>
        </div>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="New Assignment"
        footer={<><ModalBtn variant="secondary" onClick={() => setOpen(false)}>Cancel</ModalBtn><ModalBtn variant="primary" onClick={() => setOpen(false)}>Assign</ModalBtn></>}
      >
        <AssignContent />
      </Modal>
    </div>
  );
}
