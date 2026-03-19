# systemd

这个目录提供了 `hexo server` 的 `systemd` 单元文件。

## 安装

把服务文件复制到系统目录：

```bash
sudo cp /home/jebhim/repos/JBlog/deploy/systemd/hexo-server.service /etc/systemd/system/
```

重新加载 `systemd` 配置并设置开机自启：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now hexo-server.service
```

## 常用命令

查看状态：

```bash
sudo systemctl status hexo-server.service
```

查看日志：

```bash
sudo journalctl -u hexo-server.service -f
```

重启服务：

```bash
sudo systemctl restart hexo-server.service
```

停止服务：

```bash
sudo systemctl stop hexo-server.service
```

## 说明

- 服务监听在 `0.0.0.0:4000`
- 运行用户是 `jebhim`
- 工作目录固定为 `/home/jebhim/repos/JBlog`
- 依赖仓库内现有的 `node_modules`
