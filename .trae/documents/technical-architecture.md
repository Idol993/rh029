## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 + TypeScript"]
        B["Tailwind CSS"]
        C["Zustand 状态管理"]
        D["ECharts 数据可视化"]
    end
    subgraph "页面层"
        E["监管驾驶舱大屏"]
        F["实时监测"]
        G["超标预警"]
        H["环保税核算"]
        I["执法管理"]
        J["设备运维"]
        K["数据质控"]
    end
    subgraph "数据层"
        L["Mock数据服务"]
        M["本地状态管理"]
    end
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    E --> D
    F --> D
    G --> D
    H --> D
    A --> C
    C --> M
    A --> L
```

## 2. 技术说明

- **前端框架**：React 18 + TypeScript + Vite
- **样式方案**：Tailwind CSS 3 + CSS Variables 主题系统
- **状态管理**：Zustand
- **路由方案**：React Router DOM v6
- **数据可视化**：ECharts 5（图表）+ Lucide React（图标）
- **初始化工具**：vite-init
- **后端**：无（纯前端，Mock数据模拟）
- **数据存储**：前端内存 + Zustand持久化

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 重定向到驾驶舱 |
| `/dashboard` | 监管驾驶舱大屏（默认首页） |
| `/monitor` | 实时监测 - 点位总览 |
| `/monitor/water` | 实时监测 - 废水监测 |
| `/monitor/gas` | 实时监测 - 废气监测 |
| `/monitor/facility` | 实时监测 - 治污设施状态 |
| `/warning` | 超标预警 - 预警列表 |
| `/warning/:id` | 超标预警 - 预警详情 |
| `/warning/linkage` | 超标预警 - 应急联动 |
| `/tax` | 环保税核算 - 税额计算 |
| `/tax/ledger` | 环保税核算 - 排放台账 |
| `/enforcement` | 执法管理 - 任务列表 |
| `/enforcement/onsite` | 执法管理 - 现场执法 |
| `/enforcement/rectify` | 执法管理 - 整改销号 |
| `/maintenance` | 设备运维 - 设备台账 |
| `/maintenance/orders` | 设备运维 - 运维工单 |
| `/maintenance/quality` | 设备运维 - 质控审核 |
| `/quality` | 数据质控 - 质控规则 |
| `/quality/fraud` | 数据质控 - 造假识别 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    "企业" {
        string id PK
        string name
        string industry_type
        string contact
        string status
    }
    "排污口" {
        string id PK
        string enterprise_id FK
        string code
        string emission_type
        string location
        string discharge_dest
        string treatment_process
        json permit_limits
    }
    "监测设备" {
        string id PK
        string outlet_id FK
        string device_code
        string model
        string range
        string maintenance_unit
        string calibration_expiry
        string status
    }
    "监测数据" {
        string id PK
        string device_id FK
        string pollutant_code
        float value
        string unit
        datetime timestamp
        string quality_flag
    }
    "预警事件" {
        string id PK
        string outlet_id FK
        string level
        string type
        float exceed_value
        float limit_value
        datetime trigger_time
        string status
        string handler
    }
    "执法任务" {
        string id PK
        string warning_id FK
        string enforcer_id
        string type
        string status
        datetime assign_time
        datetime complete_time
    }
    "环保税记录" {
        string id PK
        string enterprise_id FK
        string period
        float tax_amount
        float equivalent_value
        string status
    }
    "运维工单" {
        string id PK
        string device_id FK
        string type
        string status
        string operator
        datetime create_time
        datetime complete_time
    }

    "企业" ||--o{ "排污口" : "拥有"
    "排污口" ||--o{ "监测设备" : "安装"
    "监测设备" ||--o{ "监测数据" : "产生"
    "排污口" ||--o{ "预警事件" : "触发"
    "预警事件" ||--o{ "执法任务" : "派单"
    "企业" ||--o{ "环保税记录" : "缴纳"
    "监测设备" ||--o{ "运维工单" : "关联"
```

## 5. 主题系统设计

```css
:root {
  --bg-primary: #0a0f1a;
  --bg-secondary: #111827;
  --bg-card: #1a2332;
  --bg-card-hover: #1f2b3d;
  --border: #2a3548;
  --text-primary: #e8edf5;
  --text-secondary: #8896ab;
  --accent-green: #00d4aa;
  --accent-green-dim: rgba(0, 212, 170, 0.15);
  --accent-orange: #ff6b35;
  --accent-red: #ff3b5c;
  --accent-yellow: #fbbf24;
  --accent-blue: #3b82f6;
}
```
