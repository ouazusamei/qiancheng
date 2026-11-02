# 钱程 v59

**[在线体验（建议电脑浏览器）](https://en-327891-12-1505581441.sh.run.tcloudbase.com/)** · **[项目说明与体验步骤](Qiancheng_v59_GitHub_Complete/Qiancheng-v59-GitHub/README.md)** · **[部署说明](Qiancheng_v59_GitHub_Complete/Qiancheng-v59-GitHub/DEPLOYMENT.md)**

钱程面向大学生和初入职场的年轻人，通过 AI 对话连接目标教练、账单体检和人情往来，形成可核对的资金计划。程序版本：**1.9.45（v59）**。

转账、取消订阅和提醒均为沙箱模拟。线上实例仅供体验，生产级验收未完成。

## 源码与验证材料

| 内容 | 位置 |
| --- | --- |
| 完整项目、原有 README、部署说明与 Dockerfile | [Qiancheng-v59-GitHub/](Qiancheng_v59_GitHub_Complete/Qiancheng-v59-GitHub/) |
| 界面截图 | [docs/screenshots/](Qiancheng_v59_GitHub_Complete/Qiancheng-v59-GitHub/docs/screenshots/) |
| 原始验证证据压缩包 | [Qiancheng-v59-evidence-pack.zip](Qiancheng_v59_GitHub_Complete/Qiancheng-v59-evidence-pack.zip) |
| 在线可查的证据报告 | [evidence/Qiancheng-v59-evidence-report.md](Qiancheng_v59_GitHub_Complete/evidence/Qiancheng-v59-evidence-report.md) |
| 核心测算与验证数据 | [evidence/Qiancheng-v59-core-data.json](Qiancheng_v59_GitHub_Complete/evidence/Qiancheng-v59-core-data.json) |
| 项目测试日志 | [evidence/results/project-tests.txt](Qiancheng_v59_GitHub_Complete/evidence/results/project-tests.txt) |
| 控制器测试日志 | [evidence/results/ui-controller-tests.txt](Qiancheng_v59_GitHub_Complete/evidence/results/ui-controller-tests.txt) |
| 补充场景与运行核验 | [scenarios.json](Qiancheng_v59_GitHub_Complete/evidence/results/scenarios.json)、[runtime-checks.json](Qiancheng_v59_GitHub_Complete/evidence/results/runtime-checks.json) |
| 验证脚本及执行方法 | [evidence/tools/](Qiancheng_v59_GitHub_Complete/evidence/tools/)、[证据包说明](Qiancheng_v59_GitHub_Complete/evidence/README.md) |

`evidence/` 是原始证据 ZIP 的逐文件解压副本，方便在线查阅；两者内容相同。证据中的 `results/`、`tools/` 路径均相对于证据包根目录。

## 验证基线与已知边界

以下数据沿用 v59 既有验证记录：项目测试 **158/158 通过**；额外控制器测试 **4/4 通过**；补充核验 **40 项中 39 项通过，A04 未通过**。各组结果分别解释，不合并为 AI 准确率或用户成功率。

**A04：目标敏感度提示与执行预览存在计算口径差异。** 该问题尚未修复；具体条件与结果见证据报告及核心数据。额外控制器测试使用 DOM 适配器与本地 HTTP，不代表真实浏览器验收。

既有验证不证明真实模型效果、实际 Docker 构建或 CloudBase 生产运行能力。持久化、多实例与生产安全验收仍需专项验证。

本次补充仓库根目录首页与项目目录内的 `.dockerignore`；业务源码、原有项目说明、测试和验证材料保持原样，未重新测算。原验证报告中的源码压缩包哈希标识原验证对象，不代表本次整合压缩包的哈希。

## 本地运行

需要 Node.js 24 或更高版本。进入项目目录后启动：

```bash
cd Qiancheng_v59_GitHub_Complete/Qiancheng-v59-GitHub
npm start
```

访问 `http://localhost:3000`。模型配置、数据目录与 CloudBase 部署步骤见[部署说明](Qiancheng_v59_GitHub_Complete/Qiancheng-v59-GitHub/DEPLOYMENT.md)。

项目测试可在项目目录执行 `npm test`；补充脚本的参数和临时数据注意事项见[证据包说明](Qiancheng_v59_GitHub_Complete/evidence/README.md)。

## 仓库目录与容器构建

仓库首页为本文件；实际项目根目录为 `Qiancheng_v59_GitHub_Complete/Qiancheng-v59-GitHub/`。Dockerfile 与 `.dockerignore` 均在实际项目根目录，容器构建时应以该目录作为构建上下文。CloudBase 上传部署包时，仍须确保 Dockerfile 位于部署包根目录，详见上方部署说明。
