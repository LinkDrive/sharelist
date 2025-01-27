import { h, ref, Ref, defineComponent, watch, onMounted, onUnmounted, nextTick, toRef, computed, withModifiers } from 'vue'
import useStore from '@/store/index'
import { storeToRefs } from 'pinia'
import { Spin, Modal, Dropdown, Popover, Menu, Badge, Checkbox, Tooltip, InputSearch, RadioGroup, Input } from 'ant-design-vue'
import Icon from '@/components/icon'
import useDisk, { IFile } from './partial/useDisk'
import './index.less'
import { isMediaSupport } from '@/utils/format'
import MediaPlayer, { usePlayer } from '@/components/player'
import Breadcrumb from './partial/breadcrumb'
import Error from './partial/error'
import { useSetting } from '@/hooks/useSetting'
import { InfoCircleOutlined, LoadingOutlined, ScissorOutlined, EditOutlined, HddOutlined, FolderAddOutlined, EllipsisOutlined, DeleteOutlined, CloudSyncOutlined, PlusOutlined, CloudDownloadOutlined, DownloadOutlined, CloseCircleFilled, SwapOutlined, SortDescendingOutlined, CalendarOutlined, FieldBinaryOutlined, ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined, MinusCircleOutlined } from '@ant-design/icons-vue'
import useConfirm, { useApiConfirm } from '@/hooks/useConfirm'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { useApi } from '@/hooks/useApi'
import { useActions } from './partial/action'
import Task from './partial/task'
import { useBoolean } from '@/hooks/useHooks'
import { useLocalStorageState } from '@/hooks/useLocalStorage'
import { Upload } from './partial/upload'
import { useScroll } from '@/hooks/useScroll'
import { useClipboard } from '@/hooks/useClipboard'
import { showImage } from '@/components/image'

export default defineComponent({
  setup() {
    const { setConfig, clearCache, config } = useSetting()

    const searchHistory = useLocalStorageState<Array<string>>('search_history', [])

    const confirmClearCache = useConfirm(clearCache, '确认', '确认清除缓存？')

    const route = useRoute()

    const store = useStore()

    const diskIntance = useDisk()

    const { loading, files, error, setPath, paths, loadMore, diskConfig, current: currentDisk, setAuth, setSort, sortConfig, onUpdate } = diskIntance

    const { rename, move, remove, mkdir, flashDownload, uploadConfirm, addDisk, setDisk, remoteDownload, showInfo } = useActions(diskIntance)

    const { setPlayer } = usePlayer('player')

    const driveEl: Ref<Element | any> = ref()

    const { node: pasteEl } = useClipboard((files) => {
      let { id } = diskConfig.value
      let dest = '/' + [...paths.value].join('/')
      uploadConfirm(files, dest, id)
    }, 'file')


    const { scrollTo, setNode, cancel: cancelScroll, isScroll, checkScroll } = useScroll(loadMore)

    onMounted(() => {
      setNode(driveEl.value)
      onUpdate(() => {
        setTimeout(checkScroll, 0)
      })
    })

    onUnmounted(() => {
      cancelScroll?.()
    })

    const onClick = (data: IFile) => {
      if (data.type == 'folder' || data.type == 'drive') {
        let target: any = {
          id: data.id
        }

        if (!data.path && !currentDisk.search) {
          target.path = currentDisk.path + '/' + data.name
        }
        setPath(target)
      } else if (data.type == 'file') {
        let mediaType = data.mediaType
        if ((data.mediaType == 'audio' || data.mediaType == 'video') && isMediaSupport(data.name, mediaType)) {

          const list: Array<IFile> = files.value.filter((i: IFile) => isMediaSupport(i.name, mediaType))
          setPlayer({
            list,
            type: mediaType,
            index: list.findIndex((i: IFile) => i.id == data.id),
          })

        }
        else if (data.mediaType == 'image') {
          const list: Array<IFile> =
            files.value.filter((i: IFile) => isMediaSupport(i.name, 'image'))

          showImage(list.map(i => i.download_url), list.findIndex(i => i.id == data.id))
        }
        else {
          window.open(data.download_url)
        }
      }
    }


    let currentFocusFile: Ref<IFile | undefined> = ref()

    const onAction = ({ key }: { key: any }) => {
      targetBind.value = false
      if (key == 'info') {
        showInfo(currentFocusFile.value as IFile)
      } else if (key == 'mount_drive') {
        addDisk()
      } else if (key == 'mkdir') {
        mkdir(diskConfig.value)
      } else if (key == 'config') {
        let name = currentFocusFile.value?.name
        let idx = config.drives.findIndex((i: IDrive) => i.name == name)
        if (idx >= 0) {
          setDisk(config.drives[idx], idx)
        }
      } else if (key == 'rename') {
        rename(currentFocusFile.value as IFile)
      } else if (key == 'move') {
        move(currentFocusFile.value as IFile)
      } else if (key == 'delete') {
        remove(currentFocusFile.value as IFile)
      } else if (key == 'upload') {

      } else if (key == 'flash_upload') {
        flashDownload(diskConfig.value)
      } else if (key == 'remote_download') {
        remoteDownload(diskConfig.value)
      }
    }

    let isActionHide = true
    let targetBind = ref(false)
    const onContextChange = (visible: boolean) => {
      console.log('action:', visible)
      // isActionHide = true

      if (visible) {
        if (targetBind.value == false) {
          currentFocusFile.value = undefined
        }
        //isActionHide = false
        // onActionVisibleChange(visible)
        // currentFocusFile.value = undefined
        //

      } else {
        // currentFocusFile.value = undefined
        // targetBind = false
        targetBind.value = false
      }
    }

    const onHover = (i: IFile | null, e?: MouseEvent) => {
      //if (!actionVisible.value) {
      //willShow = !!i
      //if (willShow) {
      console.log('on hover')
      //已存在
      if (currentFocusFile.value) {

      }
      currentFocusFile.value = i
      if (i) {
        targetBind.value = true
      }
      //}
      // onActionVisibleChange()
      //}
      /*
      if (i === null) {
        currentFocusFile.value = undefined
      } else {
        if (!actionVisible.value) {
          currentFocusFile.value = i
        }
      }*/

    }

    const download = (file: IFile | Array<IFile>) => {
      if (!Array.isArray(file)) {
        file = [file]
      }

      file.forEach((i: IFile) => {
        let a = document.createElement('a')
        let e = document.createEvent('MouseEvents')
        e.initEvent('click', false, false)
        a.href = i.download_url // 设置下载地址
        a.download = i.name
        a.dispatchEvent(e)
      })
    }

    const mainSlots = {
      overlay: () => {
        let isDriveLevel = diskConfig.value.isRoot
        // setTimeout(() => {
        //   currentFocusFile.value = undefined
        // }, 0)
        // blank area
        if (currentFocusFile.value || targetBind.value) {
          if (isDriveLevel) {
            return <Menu onClick={onAction}>
              <Menu.Item class="dropdown-item" key="config"><HddOutlined style={{ fontSize: '16px', marginRight: '8px' }} />修改配置</Menu.Item>
              <Menu.Item class="dropdown-item" key="delete"><DeleteOutlined class="danger-aciton" style={{ fontSize: '18px', marginRight: '8px' }} /><span class="danger-aciton">删除</span></Menu.Item>
            </Menu >
          } else {
            return <Menu onClick={onAction}>
              <Menu.Item class="dropdown-item" key="info"><InfoCircleOutlined style={{ fontSize: '16px', marginRight: '8px' }} />信息</Menu.Item >
              <Menu.Item class="dropdown-item" key="rename"><EditOutlined style={{ fontSize: '16px', marginRight: '8px' }} />重命名</Menu.Item >
              <Menu.Item class="dropdown-item" key="move"><ScissorOutlined style={{ fontSize: '18px', marginRight: '8px' }} />移动</Menu.Item>
              <Menu.Item class="dropdown-item" key="delete"><DeleteOutlined class="danger-aciton" style={{ fontSize: '18px', marginRight: '8px' }} /><span class="danger-aciton" >删除</span></Menu.Item>
            </Menu>
          }
        } else {
          if (isDriveLevel) {
            return <Menu onClick={onAction}>
              <Menu.Item class="dropdown-item" key="mount_drive"><HddOutlined style={{ fontSize: '16px', marginRight: '8px' }} />挂载网盘</Menu.Item>
            </Menu>
          } else {
            return <Menu onClick={onAction}>
              <Menu.Item class="dropdown-item" key="mkdir" ><FolderAddOutlined style={{ fontSize: '18px', marginRight: '8px' }} />新建文件夹</Menu.Item>
              <Upload><Menu.Item class="dropdown-item" key="upload"><Icon type='icon-upload-file-outline' style={{ fontSize: '18px', marginRight: '8px' }} />上传文件</Menu.Item></Upload>
              <Upload type="dir"><Menu.Item class="dropdown-item" key="upload_folder"><Icon type='icon-upload-folder-outline' style={{ fontSize: '18px', marginRight: '8px' }} />上传文件夹</Menu.Item></Upload>
              <Menu.Item class="dropdown-item" key="flash_upload"><CloudDownloadOutlined style={{ fontSize: '18px', marginRight: '8px' }} />云端秒传</Menu.Item>
              <Menu.Item class="dropdown-item" key="remote_download"><DownloadOutlined style={{ fontSize: '18px', marginRight: '8px' }} />离线下载</Menu.Item>
            </Menu>
          }
        }

      }
    }

    watch(
      route,
      (nv) => {
        if (route.name == 'drive') {
          let target: any = {
            path: '/' + (route.params.path as string).replace(/^\//, '')
          }
          if (route.query.search) {
            target.search = route.query.search
          }
          setPath(target)
          scrollTo(0)
          // getFiles({ path: route.params.path as string })
        }
      },
      { immediate: true },
    )

    const onTagClick = ({ path, index }: any = {}) => {
      if (path == '/') {
        setPath({ path: '/' })
      } else if (index < paths.value.length) {
        setPath({ path: '/' + paths.value.slice(0, index).join('/') })
      }
    }

    const onSelect = (i: any) => {
      i.checked = !i.checked
    }

    const onUnselectAll = () => {
      files.value.forEach((i: any) => (i.checked = false))
    }
    const onSelectAll = (e: { target: { checked: boolean } }) => {
      let val = e.target.checked
      files.value.forEach((i: any) => (i.checked = val))
    }

    const selectState = computed(() => {
      let count = files.value.filter((i: IFile) => !!i.checked).length
      let containDir = files.value.some((i: IFile) => !!i.checked && i.type == 'folder')
      let containDrive = files.value.some((i: IFile) => !!i.checked && i.type == 'drive')
      let containFile = files.value.some((i: IFile) => !!i.checked && i.type == 'file')
      // 0 unselect, 1 partially selected, 2 select all,
      let state = count == 0 ? 0 : count == files.value.length ? 2 : 1
      return {
        state, containDir, containDrive, count, total: files.value.length, containFile
      }
    })

    const onToggleSearch = () => {
      const onSearch = (value: string) => {
        console.log(value)
        if (value) {
          // router.push({ path: router.currentRoute.value.path, query: { search: value } })
          let historyRecords = [...searchHistory.value]

          let idx = historyRecords.indexOf(value)
          if (idx >= 0) {
            historyRecords.splice(idx, 1)
          }

          historyRecords.unshift(value)

          searchHistory.value = historyRecords

          setPath({ search: value, path: currentDisk.path, id: currentDisk.id })
          modal.destroy()
        }
      }

      const remove = (value: string) => {
        let idx = searchHistory.value.indexOf(value)
        if (idx >= 0) {
          searchHistory.value.splice(idx, 1)
        }
      }


      const options: Array<any> = []
      const searchMode = diskConfig.value.search

      const tips = ref(searchMode == 1 ? '* 仅支持全局搜索' : searchMode == 2 ? '* 仅支持搜索当前目录（不含子目录）' : '')
      /*
      if (searchMode == 1) {
        options.push({ label: '所有文件', value: 'global' })
      }
      if (searchMode > 1) {
        options.push({ label: '当前目录', value: 'local' })
      }
      const searchType = ref(options[0]?.value)
*/

      const modal = Modal.confirm({
        class: 'fix-modal--alone',
        width: '560px',
        maskClosable: true,
        content: () => (
          <div class="drive-search">
            <div class="flex" >
              {/* <input class="drive-search-input" type="text" placeholder="搜索文件" onKeypress={withModifiers(onEnter, ['enter'])} /> */}
              <Input class="drive-search-input" enter-button placeholder="搜索文件" onPressEnter={e => onSearch(e.target.value)} />

            </div>
            {tips.value ? <div class="tips">{tips.value}</div> : null}
            <div class="drive-search-history">
              <div class="search-history__header">搜索记录</div>
              <ul class="search-history__body">
                {
                  searchHistory.value.map((i) => <li class="search-history__item" onClick={() => onSearch(i)}><div class="flex"><ClockCircleOutlined style="margin-right:8px;" />{i}</div><MinusCircleOutlined onClick={withModifiers(() => remove(i), ['prevent', 'stop'])} /></li>)
                }
              </ul>

            </div>
            {/* {options.length ? <RadioGroup style="margin-top:8px;" options={options} value={searchType.value} onChange={(e) => searchType.value = e.target.value} name="radioGroup" ></RadioGroup> : null} */}
          </div>
        ),
      })
    }

    const changeView = () => {
      let val = store.layout == 'list' ? 'grid' : 'list'
      store.setLayout(val)
    }

    return () => (
      <div class="drive" ref={pasteEl}>
        <div class="drive__header">
          <Breadcrumb onTagClick={onTagClick} paths={paths.value} />
          <div class="drive__actions">
            {(diskConfig.value.search) ? <Icon style={{ fontSize: '18px', marginRight: '16px' }} class="drive-action-search" type="icon-search" onClick={onToggleSearch} /> : null}
            <Popover overlayClassName='popover-padding-0' placement="topRight" destroyTooltipOnHide={true} arrowPointAtCenter={true} trigger={['click']}>
              {{
                default: () => <Badge class="task-badge" dot><CloudSyncOutlined style={{ fontSize: '18px' }} /></Badge>,
                content: () => <Task style="padding:0" />
              }}
            </Popover>
            <Dropdown overlayClassName="dropdown--drive" trigger={['click']}>
              {{
                default: () => <PlusOutlined style={{ fontSize: '18px', marginLeft: '16px' }} />,
                overlay: () => (
                  <Menu onClick={onAction}>
                    <Menu.ItemGroup title="网盘">
                      <Menu.Item class="dropdown-item" key="mount_drive"><HddOutlined style={{ fontSize: '16px', marginRight: '8px' }} />挂载网盘</Menu.Item>
                    </Menu.ItemGroup>
                    <Menu.ItemGroup title="文件">
                      <Menu.Item disabled={diskConfig.value.isRoot} class="dropdown-item" key="mkdir" ><FolderAddOutlined style={{ fontSize: '18px', marginRight: '8px' }} />新建文件夹</Menu.Item>
                      <Upload disabled={diskConfig.value.isRoot}><Menu.Item disabled={diskConfig.value.isRoot} class="dropdown-item" key="upload"><Icon type='icon-upload-file-outline' style={{ fontSize: '18px', marginRight: '8px' }} />上传文件</Menu.Item></Upload>
                      <Upload disabled={diskConfig.value.isRoot} type="dir"><Menu.Item disabled={diskConfig.value.isRoot} class="dropdown-item" key="upload_folder"><Icon type='icon-upload-folder-outline' style={{ fontSize: '18px', marginRight: '8px' }} />上传文件夹</Menu.Item></Upload>
                      <Menu.Item disabled={diskConfig.value.isRoot} class="dropdown-item" key="flash_upload"><CloudDownloadOutlined style={{ fontSize: '18px', marginRight: '8px' }} />云端秒传</Menu.Item>
                      <Menu.Item disabled={diskConfig.value.isRoot} class="dropdown-item" key="remote_download"><DownloadOutlined style={{ fontSize: '18px', marginRight: '8px' }} />离线下载</Menu.Item>
                    </Menu.ItemGroup>

                  </Menu>
                )
              }}
            </Dropdown>
            <DeleteOutlined onClick={confirmClearCache} style={{ fontSize: '18px', marginLeft: '16px' }} />
          </div>
        </div>
        {
          error.code === 0 ? <div class="drive__header-assistant">
            <div class="drive__select">
              <Checkbox onChange={onSelectAll} checked={selectState.value.state == 2} indeterminate={selectState.value.state == 1} />
              <span style="margin-left:8px;">{selectState.value.state > 0 ? `已选 ${selectState.value.count} 项` : `共 ${files.value.length} 项`}</span>
            </div>
            <div class="drive__sort flex">
              <Dropdown overlayClassName="dropdown--drive" trigger={['click']}>
                {{
                  default: () => <span><SwapOutlined style="transform:rotate(90deg);margin-right:4px;" />按{sortConfig.value.key == 'name' ? '名称' : sortConfig.value.key == 'size' ? '文件大小' : '修改时间'}{sortConfig.value.type == 'asc' ? '升序' : '降序'}</span>,
                  overlay: () => <Menu onClick={({ key }: { key: any }) => setSort(key)}>
                    <Menu.Item class="dropdown-item" key="name"><div class="flex flex--between"><div><SortDescendingOutlined style={{ fontSize: '18px', marginRight: '8px' }} />名称</div>{sortConfig.value.key == 'name' ? (sortConfig.value.type == 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />) : null}</div></Menu.Item>
                    <Menu.Item class="dropdown-item flex" key="mtime"><div class="flex flex--between"><div><CalendarOutlined style={{ fontSize: '18px', marginRight: '8px' }} />修改时间</div>{sortConfig.value.key == 'mtime' ? (sortConfig.value.type == 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />) : null}</div></Menu.Item>
                    <Menu.Item class="dropdown-item flex" key="size"><div class="flex flex--between"><div><FieldBinaryOutlined style={{ fontSize: '18px', marginRight: '8px' }} />文件大小</div>{sortConfig.value.key == 'size' ? (sortConfig.value.type == 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />) : null}</div></Menu.Item>
                  </Menu>
                }}
              </Dropdown>
              <Tooltip>
                {{
                  title: '切换视图',
                  default: () => <Icon onClick={changeView} type={'icon-' + (store.layout == 'list' ? 'grid' : 'list')} style={{ fontSize: '16px', marginLeft: '8px', padding: '0 8px' }} />
                }}
              </Tooltip>

            </div>
          </div> : null
        }
        <Dropdown destroyPopupOnHide={false} trigger={['contextmenu']} onVisibleChange={onContextChange} overlayClassName="dropdown--drive" v-slots={mainSlots}>
          <div class="drive-body-wrap" ref={driveEl}>
            {/* <div class="drive-body-mask" onContextmenu={() => onHover(null)}>

            </div> */}
            <Spin delay={150} spinning={loading.value}>
              <Error value={error} onAuth={setAuth}>

                <div class={['drive-body', 'drive-body--padding', 'drive-body--' + store.layout]} >
                  {files.value.map((i: IFile) => {
                    return (
                      <a class={["item", i.checked ? 'item--checked' : null]} onContextmenu={(e) => onHover(i, e)} href={paths.value.join('/') + '/' + i.name + '?download'} title={i.name} onClick={withModifiers(() => onClick(i), ['prevent'])}>
                        <div class="item-check" onClick={withModifiers(() => onSelect(i), ['stop', 'prevent'])}><Checkbox checked={i.checked} onClick={withModifiers(() => onSelect(i), ['stop', 'prevent'])} /></div>

                        <div class="item-icon">
                          {
                            i.thumb ?
                              <div class="item-thumb" style={{ 'backgroundImage': `url(${i.thumb})` }}></div>
                              : [<Icon
                                style={{ fontSize: store.layout == 'grid' ? '64px' : '36px' }}
                                type={'icon-' + i.mediaType}
                              />,
                              i.mediaType == 'file' ? <div class={["item-icon__ext", i.ext.length > 7 ? 'item-icon__ext--sm' : i.ext.length > 4 ? 'item-icon__ext--md' : '']}>{i.ext}</div> : null
                              ]
                          }
                        </div>

                        <div class="item-meta">
                          <div class="item-name">{i.name}</div>
                          <div class="item-ctime">{i.ctimeDisplay}</div>
                          <div class="item-size">{i.sizeDisplay}</div>
                        </div>
                      </a>
                    )
                  })}
                </div>

              </Error>
            </Spin >
          </div>
        </Dropdown >

        <div class={["drive-toolbar-wrap", selectState.value.state > 0 ? 'show' : null]}>
          <div class="drive-toolbar">
            {
              !selectState.value.containDir && selectState.value.containFile ? <Tooltip>
                {{
                  title: '下载',
                  default: () => <DownloadOutlined onClick={() => download(files.value.filter((i: any) => (i.checked)))} class="drive-toolbar-item" />
                }}
              </Tooltip> : null
            }
            <Tooltip>
              {{
                title: '删除',
                default: () => <DeleteOutlined onClick={() => remove(files.value.filter((i: any) => (i.checked)))} class="drive-toolbar-item danger-aciton--hover" />
              }}
            </Tooltip>

            {
              selectState.value.count == 1 ? <Tooltip>
                {{
                  title: '重命名',
                  default: () => <EditOutlined class="drive-toolbar-item" onClick={() => rename(files.value.filter((i: any) => (i.checked))[0])} />
                }}
              </Tooltip> : null
            }
            {
              !selectState.value.containDrive ? <Tooltip>

                {{
                  title: '移动',
                  default: () => <ScissorOutlined onClick={() => move(files.value.filter((i: any) => (i.checked)))} class="drive-toolbar-item" />
                }}
              </Tooltip> : null
            }
            {
              selectState.value.count == 1 ? <Tooltip>
                {{
                  title: '信息',
                  default: () => <InfoCircleOutlined class="drive-toolbar-item" onClick={() => showInfo(files.value.filter((i: any) => (i.checked))[0])} />
                }}
              </Tooltip> : null
            }
            <Tooltip>
              {{
                title: '取消多选',
                default: () => <CloseCircleFilled onClick={onUnselectAll} class="drive-toolbar-item" />
              }}
            </Tooltip>

          </div>
        </div>
      </div >
    )
  },
})
