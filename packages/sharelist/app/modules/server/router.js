const Router = require('@koa/router')
const createAuth = (sharelist) => async (ctx, next) => {

  let token = ctx.get('authorization') || ctx.query.token
  let isAdmin = sharelist.checkAccess(token)

  if (isAdmin) {
    await next()
  } else {
    ctx.body = { error: { code: 401, message: 'Invalid password' } }
  }
}

module.exports = (app, sharelist, api, mergeRoutes) => {
  const auth = createAuth(sharelist)

  const router = new Router()
  mergeRoutes.filter(i => i.flush == 'pre').forEach(i => {
    router[i.method](i.path, i.handler)
  })
  router
    .get('/api', (ctx) => {
      ctx.body = 'hello!'
    })
    .get('/api/setting', auth, api.setting)
    .get('/api/user_config', api.userConfig)
    .post('/api/setting', auth, api.updateSetting)
    .put('/api/cache/clear', auth, api.clearCache)
    .put('/api/reload', auth, api.reload)

    .get('/api/reloadBench', api.reloadBench)
    .get('/api/drive/file/get', api.get)
    .post('/api/drive/file/get', api.get)
    .post('/api/drive/file/list', api.list)
    .post('/api/drive/file/delete', api.remove)
    .post('/api/drive/file/update', api.update)
    .post('/api/drive/file/mkdir', api.mkdir)
    .post('/api/drive/file/upload', api.upload)

    .post('/api/drive/file/create_upload', api.createUpload)
    .post('/api/drive/file/hash_save', api.hashSave)
    .get('/api/drive/file/cancel_upload/:id', api.cancelUpload)

    .post('/api/drive/file/path', api.getPath)
    .post('/api/drive/disk/delete', api.removeDisk)

    .get('/api/drive/tasks', api.tasks)

    .get('/api/drive/task/transfer/:id', api.transfer)
    .delete('/api/drive/task/transfer/:id', api.removeTransfer)
    .put('/api/drive/task/transfer/:id/resume', api.resumeTransfer)
    .put('/api/drive/task/transfer/:id/pause', api.pauseTransfer)
    .put('/api/drive/task/transfer/:id/retry', api.retryTransfer)

    // .post('/api/drive/task/remote_download', api.remoteDownload)
    // .put('/api/drive/task/remote_download/:id/pause', api.remoteDownloadPause)
    // .put('/api/drive/task/remote_download/:id/resume', api.remoteDownloadResume)
    // .delete('/api/drive/task/remote_download/:id', api.remoteDownloadRemove)


    .get('/api/config/:field', api.configField)

    .post('/api/plugin_store', auth, api.pluginStore)
    .post('/api/plugin_store/install', auth, api.installPlugin)

    .put('/api/plugin/:id(.*)/upgrade', auth, api.upgradePlugin)
    .get('/api/plugin/:id(.*)', auth, api.getPlugin)
    .post('/api/plugin', auth, api.setPlugin)
    .delete('/api/plugin/:id(.*)', auth, api.removePlugin)
    .get('/api/drive/path', api.list)
    .get('/api/drive/path/:path(.*)', api.list)
    .get('/api/drive/:path\\:file', api.get)

    .get('/api/transfer', api.transfer)


    .get('/:path(.*)', api.page)


  mergeRoutes.filter(i => i.flush == 'post').forEach(i => {
    router[i.method](i.path, i.handler)
  })

  app
    .use(router.routes())
    .use(router.allowedMethods());

  return router
}
