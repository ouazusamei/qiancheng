# 钱程 v59

**[在线体验（建议电脑浏览器）](https://en-327891-12-1505581441.sh.run.tcloudbase.com/)** · **[项目说明与体验步骤](Qiancheng-v59-GitHub/README.md)** · **[部署说明](Qiancheng-v59-GitHub/DEPLOYMENT.md)**

钱程面向大学生和初入职场的年轻人，通过 AI 对话连接目标教练、账单体检和人情往来，形成可核对的资金计划。程序版本：**1.9.45（v59）**。

转账、取消订阅和提醒均为沙箱模拟。线上实例仅供体验，生产级验收未完成。

## 源码与验证材料

| 内容 | 位置 |
| --- | --- |
| 完整项目、原有 README、部署说明与 Dockerfile | [Qiancheng-v59-GitHub/](Qiancheng-v59-GitHub/) |
| 界面截图 | [docs/screenshots/](Qiancheng-v59-GitHub/docs/screenshots/) |
| 原始验证证据压缩包 | [Qiancheng-v59-evidence-pack.zip](Qiancheng-v59-evidence-pack.zip) |
| 在线可查的证据报告 | [evidence/Qiancheng-v59-evidence-report.md](evidence/Qiancheng-v59-evidence-report.md) |
| 核心测算与验证数据 | [evidence/Qiancheng-v59-core-data.json](evidence/Qiancheng-v59-core-data.json) |
| 项目测试日志 | [evidence/results/project-tests.txt](evidence/results/project-tests.txt) |
| 控制器测试日志 | [evidence/results/ui-controller-tests.txt](evidence/results/ui-controller-tests.txt) |
| 补充场景与运行核验 | [scenarios.json](evidence/results/scenarios.json)、[runtime-checks.json](evidence/results/runtime-checks.json) |
| 验证脚本及执行方法 | [evidence/tools/](evidence/tools/)、[证据包说明](evidence/README.md) |

`evidence/` 是原始证据 ZIP 的逐文件解压副本，方便在线查阅；两者内容相同。证据中的 `results/`、`tools/` 路径均相对于证据包根目录。

## 验证基线与已知边界

以下数据沿用 v59 既有验证记录：项目测试 **158/158 通过**；额外控制器测试 **4/4 通过**；补充核验 **40 项中 39 项通过，A04 未通过**。各组结果分别解释，不合并为 AI 准确率或用户成功率。

**A04：目标敏感度提示与执行预览存在计算口径差异。** 该问题尚未修复；具体条件与结果见证据报告及核心数据。额外控制器测试使用 DOM 适配器与本地 HTTP，不代表真实浏览器验收。

既有验证不证明真实模型效果、实际 Docker 构建或 CloudBase 生产运行能力。持久化、多实例与生产安全验收仍需专项验证。

本次仓库整理保留原有源码与测试文件，仅补齐仓库首页、原有 `.dockerignore` 和验证材料；未重新测算。原验证报告中的源码压缩包哈希标识原验证对象，不代表本次整合压缩包的哈希。

## 本地运行

需要 Node.js 24 或更高版本。进入项目目录后启动：

```bash
cd Qiancheng-v59-GitHub
npm start
```

访问 `http://localhost:3000`。模型配置、数据目录与 CloudBase 部署步骤见[部署说明](Qiancheng-v59-GitHub/DEPLOYMENT.md)。

项目测试可在项目目录执行 `npm test`；补充脚本的参数和临时数据注意事项见[证据包说明](evidence/README.md)。
