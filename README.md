# ShareList

[![Build Status](https://github.com/reruin/sharelist/actions/workflows/ci.yml/badge.svg)](https://github.com/reruin/sharelist/actions/workflows/ci.yml)

ShareList 是一个易用的网盘工具，支持快速挂载 GoogleDrive、OneDrive ，可通过插件扩展功能。  
新版正在开发中，欢迎[提交反馈](https://github.com/reruin/sharelist/issues/new/choose)。[查看旧版](https://github.com/reruin/sharelist/tree/0.1)。

## 文档
[查看文档](https://reruin.github.io/sharelist/docs/#/zh-cn/)

## 进度
- [x] 核心库支持 
- [x] 新主题 
- [x] 自定义插件开发
- [x] webdav
- [x] 跨盘转移
- [x] 秒传

## 支持情况
|       | 下载 | 上传 | 列目录 | 创建目录 | 删除 | 重命名 | 远程移动 | hash | 秒传
| ----        | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
OneDrive   |  ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | sha1 | x |
GoogleDrive   |  ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | md5 | x |
Local File    |  ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | md5/sha1 | x |
AliyunDrive   |  ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | sha1 | ✓ |
CaiYun   |  ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | md5 | ✓ |
CTCloud   |  ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | md5 | ✓ |
Baidu Netdisk   |  ✓ | x | ✓ | ✓ | ✓ | ✓ | ✓ | encrypt(md5) | ✓ |

## 安装
```docker
docker run -d -v /etc/sharelist:/sharelist/cache -p 33001:33001 --name="sharelist" reruin/sharelist:next
```

[release](https://github.com/reruin/sharelist/releases)下载二进制版。


## 许可
[MIT](https://opensource.org/licenses/MIT)   
Copyright (c) 2018-present, Reruin
