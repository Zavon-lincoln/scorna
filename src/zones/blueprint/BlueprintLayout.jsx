import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Download, Edit, Loader } from 'lucide-react'
import BuilderForm from './components/builder/BuilderForm.jsx'
import BlueprintDocument from './components/blueprint/BlueprintDocument.jsx'
import { exportBlueprintPDF } from './lib/pdfExport.js'

const STORAGE_KEY = 'scorna-blueprint-draft'

const DEFAULT_DATA = {
  clientInfo: {
    preparedBy: 'Scorna',
    auditDate: new Date().toISOString().split('T')[0],
  },
  costOfInaction: { closeRate: 20 },
  websiteFindings: { gaps: [], tools: [] },
  socialFindings: { gaps: [], tools: [] },
  marketingFindings: { gaps: [], tools: [] },
  crmFindings: { gaps: [], tools: [] },
}

function loadDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_DATA, ...JSON.parse(saved) }
  } catch {
    /* ignore malformed drafts */
  }
  return DEFAULT_DATA
}

/** Builder view — the multi-step audit form. */
function BuilderView({ blueprintData, onChange }) {
  const navigate = useNavigate()
  return (
    <BuilderForm
      blueprintData={blueprintData}
      onChange={onChange}
      onGenerate={() => {
        navigate('/blueprint/preview')
        window.scrollTo({ top: 0 })
      }}
    />
  )
}

/** Preview view — the rendered, exportable blueprint document. */
function PreviewView({ blueprintData }) {
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    try {
      const { clientInfo } = blueprintData
      const name = (clientInfo.businessName || 'Client')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
      const date = clientInfo.auditDate || new Date().toISOString().split('T')[0]
      await exportBlueprintPDF(
        'blueprint-document',
        `${name}-Scorna-Blueprint-${date}.pdf`
      )
    } catch (err) {
      console.error('PDF export error:', err)
      alert(
        "PDF export failed. Try your browser's print function (Ctrl/Cmd + P) instead."
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="blueprint-shell">
      <div className="blueprint-toolbar">
        <div className="wm" style={{ fontSize: 20 }}>
          <em>S</em>CORNA
        </div>
        <div className="blueprint-toolbar-actions">
          <button className="edit-btn" onClick={() => navigate('/blueprint')}>
            <Edit size={14} />
            Edit
          </button>
          <button className="export-btn" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader size={14} className="spin" />
                Generating…
              </>
            ) : (
              <>
                <Download size={14} />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="blueprint-scroll">
        <BlueprintDocument blueprintData={blueprintData} />
      </div>
    </div>
  )
}

/**
 * Internal Blueprint Generator zone (admin only).
 * Holds the working draft in React state + localStorage (no DB persistence,
 * per spec) and routes between the builder and the exportable document.
 */
export default function BlueprintLayout() {
  const [blueprintData, setBlueprintData] = useState(loadDraft)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blueprintData))
    } catch {
      /* storage full / unavailable — draft simply won't persist */
    }
  }, [blueprintData])

  const onChange = (key, value) =>
    setBlueprintData((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="bp-root">
      <Routes>
        <Route
          index
          element={<BuilderView blueprintData={blueprintData} onChange={onChange} />}
        />
        <Route
          path="preview"
          element={<PreviewView blueprintData={blueprintData} />}
        />
        <Route path="*" element={<Navigate to="/blueprint" replace />} />
      </Routes>
    </div>
  )
}
