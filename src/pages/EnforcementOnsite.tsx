import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import type { EvidenceFile } from '@/types'
import { cn } from '@/lib/utils'
import { Upload, FileText, Camera, Video, X, Save, Send, AlertTriangle, Gavel, Plus } from 'lucide-react'

export default function EnforcementOnsite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { enforcementTasks, completeEnforcement, createRectifyFromEnforcement, addEnforcementEvidence, removeEnforcementEvidence } = useStore()
  const taskId = searchParams.get('task')
  const task = enforcementTasks.find(t => t.id === taskId)

  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const [form, setForm] = useState({
    checkTime: new Date().toISOString().slice(0, 16),
    checkLocation: task ? `${task.enterpriseName} - ${task.outletCode}` : '',
    checkTarget: task?.enterpriseName || '',
    checkContent: '',
    problems: '',
    opinion: '',
  })

  const [uploadSlots] = useState([
    { id: 's1', label: '现场全景', type: 'photo' as const, icon: Camera },
    { id: 's2', label: '排口采样', type: 'photo' as const, icon: Camera },
    { id: 's3', label: '设施状态', type: 'photo' as const, icon: Camera },
    { id: 's4', label: '现场录像', type: 'video' as const, icon: Video },
  ])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleUpload = (slot: typeof uploadSlots[0]) => {
    if (!task) return
    const file: EvidenceFile = {
      id: `ev${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${slot.label}_${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }).replace(':', '')}.${slot.type === 'photo' ? 'jpg' : 'mp4'}`,
      type: slot.type,
      size: slot.type === 'photo' ? `${(1 + Math.random() * 3).toFixed(1)}MB` : `${(5 + Math.random() * 15).toFixed(1)}MB`,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    addEnforcementEvidence(task.id, file)
    showToast(`已上传${slot.label}`)
  }

  const handleRemoveFile = (fileId: string) => {
    if (!task) return
    removeEnforcementEvidence(task.id, fileId)
  }

  const handleSubmitRecord = () => {
    if (!task) return
    completeEnforcement(task.id)
    showToast('笔录已提交，任务已完成')
    setTimeout(() => navigate('/enforcement'), 800)
  }

  const handleIssueRectify = () => {
    if (!task) return
    const rid = createRectifyFromEnforcement(task.id)
    completeEnforcement(task.id)
    showToast(`整改已下达(编号${rid})，任务已完成`)
    setTimeout(() => navigate('/enforcement/rectify'), 800)
  }

  const handlePenalty = () => {
    if (!task) return
    completeEnforcement(task.id)
    showToast('已立案处罚')
    setTimeout(() => navigate('/enforcement'), 800)
  }

  const handleSaveDraft = () => {
    showToast('已保存草稿')
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-96 text-txt-muted">
        未找到执法任务，请从执法管理进入
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg bg-accent-green/90 text-white text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 border-l-[3px] border-accent-green pl-3">
            <span className="text-sm font-semibold text-text-primary">任务信息</span>
          </div>
          <StatusBadge variant={task.status} pulse={task.status === 'in_progress'} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-txt-muted block mb-0.5">任务编号</span>
            <span className="text-text-primary font-mono">{task.id}</span>
          </div>
          <div>
            <span className="text-txt-muted block mb-0.5">任务类型</span>
            <span className="text-text-primary font-medium">{task.typeName}</span>
          </div>
          <div>
            <span className="text-txt-muted block mb-0.5">被检查企业</span>
            <span className="text-text-primary font-medium">{task.enterpriseName}</span>
          </div>
          <div>
            <span className="text-txt-muted block mb-0.5">排口编号</span>
            <span className="text-text-primary font-mono">{task.outletCode}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-cyan pl-3">
            <span className="text-sm font-semibold text-text-primary">执法笔录</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-txt-secondary mb-1.5">检查时间</label>
                <input type="datetime-local" value={form.checkTime} onChange={e => updateField('checkTime', e.target.value)}
                  className="w-full px-3 py-2 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green" />
              </div>
              <div>
                <label className="block text-[11px] text-txt-secondary mb-1.5">检查地点</label>
                <input type="text" value={form.checkLocation} onChange={e => updateField('checkLocation', e.target.value)}
                  className="w-full px-3 py-2 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-txt-secondary mb-1.5">被检查单位</label>
              <input type="text" value={form.checkTarget} onChange={e => updateField('checkTarget', e.target.value)}
                className="w-full px-3 py-2 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green" />
            </div>
            <div>
              <label className="block text-[11px] text-txt-secondary mb-1.5">检查内容</label>
              <textarea rows={3} value={form.checkContent} onChange={e => updateField('checkContent', e.target.value)}
                className="w-full px-3 py-2 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green resize-none"
                placeholder="请输入检查内容..." />
            </div>
            <div>
              <label className="block text-[11px] text-txt-secondary mb-1.5">存在问题</label>
              <textarea rows={3} value={form.problems} onChange={e => updateField('problems', e.target.value)}
                className="w-full px-3 py-2 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green resize-none"
                placeholder="请输入发现的问题..." />
            </div>
            <div>
              <label className="block text-[11px] text-txt-secondary mb-1.5">处理意见</label>
              <textarea rows={3} value={form.opinion} onChange={e => updateField('opinion', e.target.value)}
                className="w-full px-3 py-2 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green resize-none"
                placeholder="请输入处理意见..." />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-blue pl-3">
            <span className="text-sm font-semibold text-text-primary">取证上传</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {uploadSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => handleUpload(slot)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded border border-dashed border-[var(--border-light)] hover:border-accent-green hover:bg-accent-green-dim/30 transition-colors"
              >
                <slot.icon className="w-5 h-5 text-txt-muted" />
                <span className="text-[10px] text-txt-secondary">{slot.label}</span>
                <Plus className="w-3 h-3 text-accent-green opacity-60" />
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <span className="text-[11px] text-txt-secondary">已上传文件 ({task.evidenceFiles.length})</span>
            {task.evidenceFiles.length === 0 && (
              <p className="text-[11px] text-txt-muted py-2">点击上方按钮上传取证材料</p>
            )}
            {task.evidenceFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-[var(--bg-secondary)] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {file.type === 'photo' ? <Camera className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> : <Video className="w-3.5 h-3.5 text-accent-blue shrink-0" />}
                  <span className="text-text-primary truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-txt-muted text-[10px]">{file.size}</span>
                  <button onClick={() => handleRemoveFile(file.id)} className="text-txt-muted hover:text-accent-red transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-end gap-3">
        <button
          onClick={handleSaveDraft}
          className="px-4 py-2 rounded text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-txt-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />保存草稿
        </button>
        <button
          onClick={handleSubmitRecord}
          className="px-4 py-2 rounded text-xs font-medium bg-accent-blue-dim text-accent-blue hover:bg-accent-blue/20 transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />提交笔录
        </button>
        <button
          onClick={handleIssueRectify}
          className="px-4 py-2 rounded text-xs font-medium bg-accent-orange-dim text-accent-orange hover:bg-accent-orange/20 transition-colors flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />下达整改
        </button>
        <button
          onClick={handlePenalty}
          className="px-4 py-2 rounded text-xs font-medium bg-accent-red-dim text-accent-red hover:bg-accent-red/20 transition-colors flex items-center gap-1.5"
        >
          <Gavel className="w-3.5 h-3.5" />立案处罚
        </button>
      </div>
    </div>
  )
}
