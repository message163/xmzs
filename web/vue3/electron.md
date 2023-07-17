Electron是一个跨平台的桌面应用程序开发框架，它允许开发人员使用Web技术（如HTML、CSS和JavaScript）构建桌面应用程序，这些应用程序可以在Windows、macOS和Linux等操作系统上运行。

Electron的核心是`Chromium`浏览器内核和`Node.js`运行时环境。`Chromium`内核提供了现代浏览器的功能，例如HTML5和CSS3支持，JavaScript引擎等，而Node.js运行时环境则提供了服务器端JavaScript的能力和模块系统，这使得开发人员可以使用Node.js的模块和工具来构建桌面应用程序。

Electron 案例

1.  Visual Studio Code：由Microsoft开发的跨平台代码编辑器，支持多种编程语言和插件扩展。使用Electron和TypeScript构建。
1.  Atom：由GitHub开发的跨平台代码编辑器，支持多种编程语言和插件扩展。使用Electron和CoffeeScript构建。
1.  Postman：由Postman Inc.开发的API测试和开发工具，允许用户轻松地测试和调试REST API。使用Electron和React构建。


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7619b1ae11e04148a86aa462b2cc8121~tplv-k3u1fbpfcp-watermark.image?)

### 创建项目 dev

```shell
# 创建Vue项目
 npm init vue 
# 安装依赖
npm install
# 一定要安装成开发依赖
npm install electron electron-builder -D 
# 安装超时 请使用某宝镜像 或者XX上网
npm config set electron_mirror=https://registry.npmmirror.com/-/binary/electron/
```

#### 开发环境启动electron

我们希望npm run dev的时候直接把electron也启动起来而不是开两个启动一次vite再启动一次electron

第一步我们需要先建立一个文件夹

在根目录创建一个`plugins`编写vite插件帮我们启动electron

```js
 plugins
   vite.electron.dev.ts //编写electron开发模式
   vite.electron.build.ts //打包electron项目
 index.html
 src
   main.ts
   App.vue
   background.ts //手动创建文件用于编写electron
 package.json
 tsconfig.json
 vite.config.ts
```

#### background.ts

```ts
import { app, BrowserWindow } from 'electron'

// 等待Electron应用就绪后创建BrowserWindow窗口
app.whenReady().then(async () => {
    const win = await new BrowserWindow({
        width: 800,
        height: 600,

        // 配置窗口的WebPreferences选项，用于控制渲染进程的行为
        webPreferences: {
            nodeIntegration: true, // 启用Node.js集成
            contextIsolation: false, // 禁用上下文隔离
            webSecurity: false, // 禁用web安全策略
        }
    })

    // 根据命令行参数加载URL或本地文件
    if (process.argv[2]) {
        win.loadURL(process.argv[2])
    } else {
        win.loadFile('index.html')
    }
})
```
这段代码创建了一个Electron应用程序的入口文件。该文件使用了Electron的`app`和`BrowserWindow`模块来创建一个窗口。在应用程序准备就绪后，它会创建一个新的`BrowserWindow`对象，并将其设置为800x600像素的大小。窗口的`webPreferences`选项用于配置渲染进程的行为，例如启用Node.js集成、禁用上下文隔离和web安全策略等。

接着，该代码检查命令行参数，如果有参数则加载URL，否则加载本地文件`index.html`。在开发模式下，可以将URL指向本地的开发服务器，以便实现热更新和实时调试。在生产模式下，需要将URL指向本地的`index.html`文件，以便在本地运行Electron应用程序。

在这段代码中，`app.whenReady()`函数用于在Electron应用程序准备就绪后执行回调函数。该函数返回一个Promise对象，可以使用`async/await`语法来等待应用程序就绪后执行其他操作。在这个例子中，我们使用`await`关键字来等待`BrowserWindow`对象的创建完成。


#### vite.electron.dev.ts

```ts
// 导入需要使用的类型和库
import type { Plugin } from 'vite'
import type { AddressInfo } from 'net'
import { spawn } from 'child_process'
import fs from 'fs'

// 导出Vite插件函数
export const viteElectronDev = (): Plugin => {
    return {
        name: 'vite-electron-dev',
        // 在configureServer中实现插件的逻辑
        configureServer(server) {
            // 定义初始化Electron的函数
            const initElectron = () => {
                // 使用esbuild编译TypeScript代码为JavaScript
                require('esbuild').buildSync({
                    entryPoints: ['src/background.ts'],
                    bundle: true,
                    outfile: 'dist/background.js',
                    platform: 'node',
                    target: 'node12',
                    external: ['electron']
                })
            }

            // 调用初始化Electron函数
            initElectron()

            // 监听Vite的HTTP服务器的listening事件
            server?.httpServer?.once('listening', () => {
                // 获取HTTP服务器的监听地址和端口号
                const addressInfo = server?.httpServer?.address() as AddressInfo
                const IP = `http://localhost:${addressInfo.port}`
                // 启动Electron进程
                let electronProcess = spawn(require('electron'), ['dist/background.js', IP])

                // 监听主进程代码的更改
                fs.watchFile('src/background.ts', () => {
                    // 杀死当前的Electron进程
                    electronProcess.kill()
                    // 重新编译主进程代码并重新启动Electron进程
                    initElectron()
                    electronProcess = spawn(require('electron'), ['dist/background.js', IP])
                })

                // 监听Electron进程的stdout输出
                electronProcess.stdout?.on('data', (data) => {
                    console.log(`日志: ${data}`);
                });
            })
        }
    }
}
```
 `configureServer`是Vite的一个插件钩子函数，用于在Vite开发服务器启动时执行一些自定义逻辑。该函数接受一个`ServerOptions`对象作为参数，该对象包含有关当前Vite服务器的配置信息。在这个钩子函数中，您可以访问Vite服务器的HTTP服务器对象（`httpServer`），WebSocket服务器对象（`wsServer`）和Vite的构建配置对象（`config`）等。您可以使用这些对象来实现各种功能，例如自定义路由、添加中间件、实现实时重载和调试等。
 
 esbuild.buildSync()

-   `entryPoints`：指定要编译的入口文件，这里是`src/background.ts`。
-   `bundle`：指定是否打包所有依赖项，这里是`true`，表示需要打包所有依赖项。
-   `outfile`：指定输出文件的路径和名称，这里是`dist/background.js`。
-   `platform`：指定编译的目标平台，这里是`node`，表示编译为Node.js可用的代码。
-   `target`：指定编译的目标JavaScript版本，这里是`node12`，表示编译为Node.js 12及以上版本可用的代码。
-   `external`：指定不需要被打包的外部依赖项，这里是`['electron']`，表示`electron`模块不需要被打包。

在这段代码中，`esbuild`会将`src/background.ts`文件编译为JavaScript 并且放入dist

`fs.watch` 主要实现热更新
每次background.ts 修改完成就会重新启动electron进程


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20b73130bc3a4454a1abb6c5aea5ce2e~tplv-k3u1fbpfcp-watermark.image?)

#### vite.electron.build.ts
```ts
import type { Plugin } from 'vite'
import * as electronBuilder from 'electron-builder'
import path from 'path'
import fs from 'fs'

// 导出Vite插件函数
export const viteElectronBuild = (): Plugin => {
    return {
        name: 'vite-electron-build',

        // closeBundle是Vite的一个插件钩子函数，用于在Vite构建完成后执行一些自定义逻辑。
        closeBundle() {

            // 定义初始化Electron的函数
            const initElectron = () => {
                // 使用esbuild编译TypeScript代码为JavaScript
                require('esbuild').buildSync({
                    entryPoints: ['src/background.ts'],
                    bundle: true,
                    outfile: 'dist/background.js',
                    platform: 'node',
                    target: 'node12',
                    external: ['electron'],
                })
            }

            // 调用初始化Electron函数
            initElectron()

            // 修改package.json文件的main字段 不然会打包失败
            const json =  JSON.parse(fs.readFileSync('package.json', 'utf-8')) 
            json.main = 'background.js'
            fs.writeSync(fs.openSync('dist/package.json', 'w'), JSON.stringify(json, null, 2))

            // 创建一个空的node_modules目录 不然会打包失败
            fs.mkdirSync(path.join(process.cwd(), "dist/node_modules"));

            // 使用electron-builder打包Electron应用程序
            electronBuilder.build({
                config: {
                    appId: 'com.example.app',
                    productName: 'vite-electron',
                    directories: {
                        output: path.join(process.cwd(), "release"), //输出目录
                        app: path.join(process.cwd(), "dist"), //app目录
                    },
                    asar: true,
                    nsis: {
                        oneClick: false, //取消一键安装
                    }
                }
            })
        }
    }
}
```

打包主要依靠`electron-builder` 这个库 他的参数是有很多的这儿只是简单演示

`closeBundle` 我们electron打包是需要index.html 所以我们先等vite打完包之后vite会自动调用这个钩子 然后在这个钩子里面打包electron

#### vite.config.ts
```ts
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {viteElectronDev} from './plugins/vite.electron.dev'
import {viteElectronBuild} from './plugins/vite.electron.build'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteElectronDev(),
    viteElectronBuild()
  ],
  base:'./', //默认绝对路径改为相对路径 否则打包白屏
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

```

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4112829a8f434ec2b4baf8eb11bbe0e4~tplv-k3u1fbpfcp-watermark.image?)





