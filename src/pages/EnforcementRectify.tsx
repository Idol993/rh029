import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import type { EvidenceFile } from '@/types'
import { Check, Camera, Video, Upload, FileText, X, CheckCircle2, AlertCircle, Eye } from 'lucide-react'

const STEPS = [
  { key: 0, label: '下达整改', desc: '通知企业整改', icon: AlertCircle },
  { key: 1, label: '整改反馈', desc: '企业提交材料', icon: Upload },
  { key: 2, label: '复核检查', desc: '现场核查确认', icon: CheckCircle2 },
  { key: 3, label: '整改销号', desc: '流程闭环完成', icon: Check },
]

export default function EnforcementRectify() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { enforcementTasks, setRectifyStep, closeRectify, addRectifyFile, removeRectifyFile } = useStore()
  const paramTaskId = searchParams.get('task')
  const rectifyTasks = enforcementTasks.filter(t => t.type === 'rectify')
  const [selectedId, setSelectedId] = useState(paramTaskId || rectifyTasks[0]?.id || '')
  const task = enforcementTasks.find(t => t.id === selectedId)

  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleUploadRectifyFile = () => {
    if (!task) return
    const fileNames = [
      '整改报告',
      '整改措施说明',
      '现场复测照片',
      '运维记录',
      '检测报告',
      '承诺书',
    ]
    const name = fileNames[Math.floor(Math.random() * fileNames.length)]
    const isPhoto = name.includes('照片') || name.includes('记录')
    const file: EvidenceFile = {
      id: `rf${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${name}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.${isPhoto ? 'jpg' : 'pdf'}`,
      type: isPhoto ? 'photo' : 'document',
      size: isPhoto ? `${(1 + Math.random() * 3).toFixed(1)}MB` : `${(0.2 + Math.random() * 1.5).toFixed(1)}MB`,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    addRectifyFile(task.id, file)
    if (task.rectifyStep < 1) {
      setRectifyStep(task.id, 1)
    }
    showToast(`已上传企业反馈材料：${file.name}`)
  }

  const handleNextStep = (step: number) => {
    if (!task) return
    if (step === 1 && task.rectifyFiles.length === 0) {
      showToast('请先上传企业整改反馈材料')
      return
    }
    setRectifyStep(task.id, step)
    showToast(`已进入：${STEPS[step].label}`)
  }

  const handleCloseRectify = () => {
    if (!task) return
    closeRectify(task.id)
    showToast('整改已销号，流程闭环完成')
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-96 text-txt-muted">
        暂无整改任务
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
          <div className="flex items-center gap-2 border-l-[3px] border-accent-yellow pl-3">
            <span className="text-sm font-semibold text-text-primary">整改销号管理</span>
          </div>
          <StatusBadge variant={task.status} />
        </div>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-txt-muted block mb-0.5">任务编号</span>
            <span className="text-text-primary font-mono">{task.id}</span>
          </div>
          <div>
            <span className="text-txt-muted block mb-0.5">企业名称</span>
            <span className="text-text-primary font-medium">{task.enterpriseName}</span>
          </div>
          <div>
            <span className="text-txt-muted block mb-0.5">排口编号</span>
            <span className="text-text-primary font-mono">{task.outletCode}</span>
          </div>
          <div>
            <span className="text-txt-muted block mb-0.5">派单时间</span>
            <span className="text-text-primary font-mono">{task.assignTime}</span>
          </div>
        </div>
        {rectifyTasks.length > 1 && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <span className="text-[10px] text-txt-muted block mb-2">切换整改任务：</span>
            <div className="flex flex-wrap gap-2">
              {rectifyTasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`px-3 py-1.5 rounded text-[10px] transition-colors ${
                    t.id === selectedId
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                      : 'bg-[var(--bg-secondary)] text-txt-secondary border border-[var(--border)] hover:text-text-primary'
                  }`}
                >
                  {t.enterpriseName.slice(0, 6)} · {t.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-5 border-l-[3px] border-accent-green pl-3">
          <span className="text-sm font-semibold text-text-primary">整改进度</span>
        </div>
        <div className="flex items-start relative">
          {STEPS.map((step, idx) => (
            <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                task.rectifyStep > idx
                  ? 'bg-accent-green border-accent-green text-white'
                  : task.rectifyStep === idx
                  ? 'bg-accent-yellow/20 border-accent-yellow text-accent-yellow animate-pulse'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-light)] text-txt-muted'
              }`}>
                {task.rectifyStep > idx ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className="text-xs mt-2 text-text-primary font-medium">{step.label}</span>
              <span className="text-[10px] mt-0.5 text-txt-secondary">{step.desc}</span>
              {task.rectifyStepTimes[idx + 1] && (
                <span className="text-[9px] mt-1 text-txt-muted font-mono">{task.rectifyStepTimes[idx + 1].slice(5, 16)}</span>
              )}
              <div className="mt-2">
                {task.rectifyStep === idx && task.status !== 'closed' && (
                  <button
                    onClick={() => handleNextStep(idx + 1)}
                    className="px-3 py-1 rounded text-[10px] font-medium bg-accent-green-dim text-accent-green hover:bg-accent-green/20 transition-colors"
                  >
                    进入下一步
                  </button>
                )}
                {task.rectifyStep >= idx + 1 && task.rectifyStepTimes[idx + 1] && idx < 3 && (
                  <span className="text-[10px] text-accent-green">✓ 已完成</span>
                )}
                {task.rectifyStep === 3 && idx === 3 && task.status !== 'closed' && (
                  <button
                    onClick={handleCloseRectify}
                    className="px-3 py-1 rounded text-[10px] font-medium bg-accent-green text-white hover:bg-accent-green/80 transition-colors"
                  >
                    销号确认
                  </button>
                )}
                {task.status === 'closed' && idx === 3 && (
                  <span className="text-[10px] text-accent-green font-medium">✓ 已销号</span>
                )}
              </div>
            </div>
          ))}
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-[var(--border-light)] -z-0 mx-10" />
          <div
            className="absolute top-5 left-0 h-[2px] bg-accent-green -z-0 transition-all duration-500 mx-10"
            style={{ width: `calc(${(Math.min(task.rectifyStep, 3) / 3) * 100}% - 5rem * ${(Math.min(task.rectifyStep, 3) / 3)})` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 border-l-[3px] border-accent-blue pl-3">
              <Camera className="w-4 h-4 text-accent-blue" />
              <span className="text-sm font-semibold text-text-primary">执法取证材料</span>
            </div>
            <span className="text-[10px] text-txt-muted">{task.evidenceFiles.length} 份</span>
          </div>
          {task.evidenceFiles.length === 0 ? (
            <p className="text-[11px] text-txt-muted py-8 text-center">暂无执法取证材料</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {task.evidenceFiles.map(f => (
                <div key={f.id} className="rounded border border-accent-blue/30 bg-accent-blue-dim/30 p-2">
                  <div className="aspect-video rounded bg-[var(--bg-secondary)]/60 flex items-center justify-center mb-1.5">
                    {f.type === 'photo'
                      ? <Camera className="w-5 h-5 text-txt-secondary" />
                      : f.type === 'video'
                      ? <Video className="w-5 h-5 text-txt-secondary" />
                      : <FileText className="w-5 h-5 text-txt-secondary" />}
                  </div>
                  <p className="text-[10px] text-text-primary truncate font-medium">{f.name}</p>
                  <div className="flex items-center justify-between text-[9px] text-txt-muted mt-0.5">
                    <span>{f.size}</span>
                    <span className="font-mono">{f.uploadedAt.slice(5, 16)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 border-l-[3px] border-accent-yellow pl-3">
              <FileText className="w-4 h-4 text-accent-yellow" />
              <span className="text-sm font-semibold text-text-primary">企业整改反馈材料</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-txt-muted">{task.rectifyFiles.length} 份</span>
              {task.status !== 'closed' && (
                <button
                  onClick={handleUploadRectifyFile}
                  className="px-2.5 py-1 rounded text-[10px] font-medium bg-accent-yellow-dim text-accent-yellow hover:bg-accent-yellow/20 transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> 上传整改材料
                </button>
              )}
            </div>
          </div>
          {task.rectifyFiles.length === 0 ? (
            <div className="py-8 text-center">
              <Upload className="w-8 h-8 text-txt-muted mx-auto mb-2 opacity-40" />
              <p className="text-[11px] text-txt-muted">点击右上角按钮上传企业反馈材料</p>
            </div>
          ) : (
            <div className="space-y-2">
              {task.rectifyFiles.map(f => (
                <div key={f.id} className="flex items-center justify-between p-2.5 rounded bg-[var(--bg-secondary)] border-l-2 border-accent-yellow">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-accent-yellow-dim/50 flex items-center justify-center shrink-0">
                      {f.type === 'photo'
                        ? <Camera className="w-4 h-4 text-accent-yellow" />
                        : f.type === 'video'
                        ? <Video className="w-4 h-4 text-accent-yellow" />
                        : <FileText className="w-4 h-4 text-accent-yellow" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-text-primary font-medium truncate">{f.name}</p>
                      <div className="flex items-center gap-2 text-[9px] text-txt-muted">
                        <span>{f.size}</span>
                        <span className="font-mono">{f.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="p-1 rounded hover:bg-[var(--border-light)]/50 text-txt-muted hover:text-accent-cyan transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {task.status !== 'closed' && (
                      <button
                        onClick={() => removeRectifyFile(task.id, f.id)}
                        className="p-1 rounded hover:bg-accent-red-dim/50 text-txt-muted hover:text-accent-red transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(`/enforcement/detail?task=${task.id}`)}
          className="text-[11px] text-txt-secondary hover:text-accent-cyan transition-colors flex items-center gap-1"
        >
          查看完整执法档案
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/enforcement')}
            className="px-4 py-2 rounded text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-txt-secondary hover:text-text-primary transition-colors"
          >
            返回执法管理
          </button>
          {task.status === 'closed' ? (
            <span className="px-4 py-2 rounded text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/30">
              ✓ 已销号完成
            </span>
          ) : (
            <button
              onClick={handleCloseRectify}
              disabled={task.rectifyStep < 3}
              className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                task.rectifyStep < 3
                  ? 'bg-[var(--bg-secondary)] text-txt-muted cursor-not-allowed border border-[var(--border)]'
                  : 'bg-accent-green text-white hover:bg-accent-green/80'
              }`}
            >
              销号确认
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
