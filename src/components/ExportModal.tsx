import { useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useCanvasStore } from '../store/useCanvasStore'
import { useDesignStore } from '../store/useDesignStore'
import {
  CODE_TARGETS,
  type CodeTarget,
  generateCode,
  generateTokens,
  generateBrief,
  downloadText,
  downloadDataUrl,
  ensureTree,
} from '../lib/exports'

interface Props {
  open: boolean
  onClose: () => void
}

export function ExportModal({ open, onClose }: Props) {
  const role = useProjectStore((s) => s.role)
  const projectName = useProjectStore((s) => s.projectName)
  const shapes = useCanvasStore((s) => s.shapes)
  const designTree = useDesignStore((s) => s.designTree)
  const [codeTarget, setCodeTarget] = useState<CodeTarget>('react-tailwind')
  const [preview, setPreview] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState('')

  if (!open) return null

  const tree = ensureTree(shapes, role, projectName || 'Untitled', designTree)
  const base = (projectName || 'sketch').replace(/\s+/g, '-').toLowerCase()

  const runCode = (download: boolean) => {
    const { filename, content } = generateCode(tree, codeTarget)
    if (download) {
      downloadText(`${base}-${filename}`, content, 'text/plain')
    } else {
      setPreview(content)
      setPreviewName(filename)
    }
  }

  const runTokens = (download: boolean) => {
    const t = generateTokens(tree)
    if (download) {
      downloadText(`${base}-${t.filenameJson}`, t.json, 'application/json')
      downloadText(`${base}-${t.filenameCss}`, t.css, 'text/css')
    } else {
      setPreview(t.json + '\n\n/* CSS */\n' + t.css)
      setPreviewName('tokens')
    }
  }

  const runBrief = (download: boolean) => {
    const md = generateBrief(tree, shapes)
    if (download) {
      downloadText(`${base}-brief.md`, md, 'text/markdown')
    } else {
      setPreview(md)
      setPreviewName('brief.md')
    }
  }

  const runPng = () => {
    const fn = (window as unknown as { __sketchforgeExportPng?: () => string | null }).__sketchforgeExportPng
    const data = fn?.()
    if (data) downloadDataUrl(`${base}.png`, data)
  }

  const runAgent = () => {
    if (!designTree) {
      useDesignStore.setState({ designTree: tree, mode: 'polished', selectedNodeId: tree.root.id })
    }
    const data = useDesignStore.getState().getAgentPayloadJson() || JSON.stringify(tree, null, 2)
    downloadText(`${base}.agent.json`, data, 'application/json')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Export · {role}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Close
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4 md:flex-row">
          <div className="flex w-full flex-col gap-3 md:w-56">
            <Section title="Universal">
              <Btn onClick={runPng}>PNG snapshot</Btn>
              <Btn onClick={runAgent}>Agent payload (JSON)</Btn>
            </Section>

            {role === 'developer' && (
              <Section title="Code">
                <select
                  value={codeTarget}
                  onChange={(e) => setCodeTarget(e.target.value as CodeTarget)}
                  className="mb-1 w-full rounded border px-2 py-1.5 text-xs"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  {CODE_TARGETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <Btn onClick={() => runCode(false)}>Preview</Btn>
                <Btn primary onClick={() => runCode(true)}>
                  Download code
                </Btn>
              </Section>
            )}

            {(role === 'designer' || role === 'general') && (
              <Section title="Design tokens">
                <Btn onClick={() => runTokens(false)}>Preview</Btn>
                <Btn primary onClick={() => runTokens(true)}>
                  Download tokens
                </Btn>
              </Section>
            )}

            {(role === 'marketer' || role === 'general') && (
              <Section title="Campaign">
                <Btn onClick={() => runBrief(false)}>Preview brief</Btn>
                <Btn primary onClick={() => runBrief(true)}>
                  Download brief
                </Btn>
                <Btn onClick={runPng}>Asset PNG</Btn>
              </Section>
            )}

            {role !== 'developer' && (
              <Section title="Also available">
                <select
                  value={codeTarget}
                  onChange={(e) => setCodeTarget(e.target.value as CodeTarget)}
                  className="mb-1 w-full rounded border px-2 py-1.5 text-xs"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  {CODE_TARGETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <Btn onClick={() => runCode(true)}>Download code</Btn>
                {role === 'marketer' && (
                  <Btn onClick={() => runTokens(true)}>Download tokens</Btn>
                )}
              </Section>
            )}
            {role === 'developer' && (
              <Section title="Also available">
                <Btn onClick={() => runTokens(true)}>Download tokens</Btn>
                <Btn onClick={() => runBrief(true)}>Download brief</Btn>
              </Section>
            )}
          </div>

          <div
            className="min-h-[200px] flex-1 overflow-auto rounded-lg border p-3"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            {preview ? (
              <>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {previewName}
                </p>
                <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed" style={{ color: 'var(--text)' }}>
                  {preview.slice(0, 12000)}
                  {preview.length > 12000 ? '\n…' : ''}
                </pre>
              </>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Choose an export on the left. Preview appears here; Download saves a file.
                {shapes.length === 0 && ' Draw or Generate a design first.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

function Btn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded px-2.5 py-1.5 text-left text-[11px] font-medium"
      style={{
        background: primary ? 'var(--accent)' : 'var(--bg-panel)',
        color: primary ? '#fff' : 'var(--text)',
        border: primary ? 'none' : '1px solid var(--border)',
      }}
    >
      {children}
    </button>
  )
}
