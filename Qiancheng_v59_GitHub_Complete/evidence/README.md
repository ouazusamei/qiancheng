# 钱程v59材料核验包（非部署包）

制作材料先读 Qiancheng-v59-evidence-report.md，并导入 Qiancheng-v59-core-data.json；产品使用单独的 Qiancheng-v59-CloudBase.zip。

Node.js>=24。将产品ZIP解压到源码目录，从本包执行：

```bash
mkdir -p results
node tools/scenarios.mjs /绝对路径/源码 /绝对路径/本包/results
node tools/runtime-checks.mjs /绝对路径/源码 /绝对路径/本包/results
node tools/benchmark.mjs /绝对路径/源码 /绝对路径/本包/results/benchmark.json
QC_SOURCE_ROOT=/绝对路径/源码 node --test tools/domain-ui.test.mjs
cd /绝对路径/源码
npm test
```

运行前将当前终端BIGMODEL_API_KEY和BIGMODEL_MODEL设为空，避免真实模型调用。补充脚本只临时模拟模型失败，测试使用临时SQLite并删除，不能对生产数据库运行。
项目20项新增修复测试含本地模拟模型HTTP服务，不证明真实模型可用。额外4项UI是控制器/DOM适配器+本地HTTP，非真实浏览器。

以最终日志 results/project-tests.txt 和 JSON validation.projectTests 为准。当前最终项目测试为158项；额外UI为4项；材料检查40项有1项既有敏感度失败，各组不重复相加。

归档包含最终日志、未改原件身份、源码哈希、打包烟测、修复前后资源对比。没有原产品副本、用户数据库、截图或真实密钥。
