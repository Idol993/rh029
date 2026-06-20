import { useState } from 'react'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import { cn } from '@/lib/utils'
import { Upload, FileText, Camera, Video, X, Save, Send, AlertTriangle, Gavel } from 'lucide-react'

interface UploadFile {
  id: string
  name: string
  type: 'photo' | 'video'
  size: string
}

export default function EnforcementOnsite() {
  const { enforcementTasks } = useStore()
  const task = enforcementTasks.find(t => t.status === 'in_progress') || enforcementTasks[0]

  const [form, setForm] = useState({
    checkTime: new Date().toISOString().slice(0, 16),
    checkLocation: task ? `${task.enterpriseName} - ${task.outletCode}` : '',
    checkTarget: task?.enterpriseName || '',
    checkContent: '',
    problems: '',
    opinion: '',
  })

  const [files, setFiles] = useState<UploadFile[]>([
    { id: 'f1', name: '排口采样照片_001.jpg', type: 'photo', size: '2.4MB' },
    { id: 'f2', name: '设施运行状态_002.jpg', type: 'photo', size: '1.8MB' },
  ])

  const [uploadSlots] = useState([
    { id: 's1', label: '现场全景', icon: Camera },
    { id: 's2', label: '排口采样', icon: Camera },
    { id: 's3', label: '设施状态', icon: Camera },
    { id: 's4', label: '现场录像', icon: Video },
  ])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 border-l-[3px] border-accent-green pl-3">
            <span className="text-sm font-semibold text-text-primary">任务信息</span>
          </div>
          {task && <StatusBadge variant={task.status} pulse={task.status === 'in_progress'} />}
        </div>
        {task && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
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
            <div>
              <span className="text-txt-muted block mb-0.5">执法人</span>
              <span className="text-text-primary font-medium">{task.enforcerName}</span>
            </div>
          </div>
        )}
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
              <button key={slot.id} className="flex flex-col items-center justify-center gap-2 p-4 rounded border border-dashed border-[var(--border-light)] hover:border-accent-green hover:bg-accent-green-dim/30 transition-colors">
                <slot.icon className="w-5 h-5 text-txt-muted" />
                <span className="text-[10px] text-txt-secondary">{slot.label}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <span className="text-[11px] text-txt-secondary">已上传文件</span>
            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-[var(--bg-secondary)] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {file.type === 'photo' ? <Camera className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> : <Video className="w-3.5 h-3.5 text-accent-blue shrink-0" />}
                  <span className="text-text-primary truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-txt-muted text-[10px]">{file.size}</span>
                  <button onClick={() => removeFile(file.id)} className="text-txt-muted hover:text-accent-red transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-end gap-3">
        <button className="px-4 py-2 rounded text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-txt-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />保存草稿
        </button>
        <button className="px-4 py-2 rounded text-xs font-medium bg-accent-blue-dim text-accent-blue hover:bg-accent-blue/20 transition-colors flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5" />提交笔录
        </button>
        <button className="px-4 py-2 rounded text-xs font-medium bg-accent-orange-dim text-accent-orange hover:bg-accent-orange/20 transition-colors flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />下达整改
        </button>
        <button className="px-4 py-2 rounded text-xs font-medium bg-accent-red-dim text-accent-red hover:bg-accent-red/20 transition-colors flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5" />立案处罚
        </button>
      </div>
    </div>
  )
}
