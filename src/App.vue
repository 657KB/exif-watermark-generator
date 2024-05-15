<script setup lang="ts">
import { NAlert } from 'naive-ui'
import { reactive } from 'vue'
import { Tags } from 'exifreader'
import asyncPool from 'tiny-async-pool'
import AddPhoto from './components/AddPhoto.vue'
import FooterInformation from './components/FooterInformation.vue'
import ProcessList from './components/ProcessList.vue'
import getEXIF from './util/exif'
import { generateImageWithExifPhotoFrame } from './util/generate'
// import { downloadZip } from 'client-zip'

type StateType = {
  errorFileNotSupport: boolean
  hideAppPhoto: boolean
  processList: ProcessItem[]
}

export type ProcessItem = {
  image: File
  status: 'waiting' | 'processing' | 'done' | 'failed'
  exif: Tags | null
  url: string | null
}

const state = reactive<StateType>({
  errorFileNotSupport: false,
  hideAppPhoto: false,
  processList: [],
})

const getAllExif = async (list: ProcessItem[]) => {
  return Promise.all(list.map(item => getEXIF(item.image)))
}

const start = async (list: ProcessItem[]) => {
  const allExif = await getAllExif(list)
  allExif.forEach((exif, index) => {
    if (typeof exif === 'string') {
      state.processList[index].status = 'failed'
    } else {
      state.processList[index].exif = exif
    }
  })
  if (import.meta.env.DEV) {
    state.processList.forEach(item => {
      console.log(
        'File:', item.image.name, `${(item.image.size / 1024 / 1024).toFixed(2)}MB`,
        '\nDateTime:', item.exif?.DateTime?.description,
        '\nModel:', item.exif?.Model?.description,
        '\nMake:', item.exif?.Make?.description,
        '\nLensModel:', item.exif?.LensModel?.description,
        '\nFocalLengthIn35mmFilm:', item.exif?.FocalLengthIn35mmFilm?.description,
        '\nFNumber:', item.exif?.FNumber?.description,
        '\nExposureTime:', item.exif?.ExposureTime?.description,
        '\nISOSpeedRatings:', item.exif?.ISOSpeedRatings?.description,
      )
    })
  }
  process(state.processList)
}

const process = async (list: ProcessItem[]) => {
  const withIndexList = list.map((item, index) => ({ item, index }))
  const iteratorFn = async ({ item, index } : { item: ProcessItem, index: number }) => {
    if (item.status !== 'failed') {
      state.processList[index].status = 'processing'
      try {
        const url = await generateImageWithExifPhotoFrame(item.image, item.exif!)
        return { index, url }
      } catch (expection) {
        console.error(expection)
      }
    }
    return { index, url: null }
  }
  for await (const { index, url } of asyncPool(3, withIndexList, iteratorFn)) {
    if (url !== null) {
      state.processList[index].status = 'done'
      state.processList[index].url = url
    } else {
      state.processList[index].status = 'failed'
    }
  }
}

const onErrorIsNotSupportFileAlertLeave = () => {
  state.errorFileNotSupport = false
}

const onUploadImage = async (files: FileList) => {
  const list: ProcessItem[] = []
  const len = files.length
  for (let i = 0; i < len; i += 1) {
    const file = files.item(i)
    if (file !== null) {
      list.push({ image: file, status: 'waiting', exif: null, url: null })
    }
  }

  state.processList = list
  state.hideAppPhoto = true

  start(list)
}

const onBackToAddPhoto = () => {
  state.hideAppPhoto = false
  state.processList = []
}
const downloadImage = (item: ProcessItem) => {
  const link = document.createElement('a')
  link.download = `new_${item.image.name}`
  link.href = item.url!
  link.click()
}
const downloadAll = () => {
  // const input = state.processList
  //   .filter(({ status, url }) => status === 'done' && url !== null)
  //   .map(({ url }) => fetch(url!))
}
</script>

<template>
  <div class="alert-list">
    <NAlert
      v-if="state.errorFileNotSupport"
      class="alert"
      title="Error"
      type="error"
      closable
      :bordered="false"
      @after-leave="onErrorIsNotSupportFileAlertLeave"
    >
      选择的图片中包含不支持的文件（不是图片 or 不是 jpg 格式的图片）
    </NAlert>
  </div>
  <div class="main">
    <AddPhoto
      v-if="!state.hideAppPhoto"
      @error-file-not-support="() => { state.errorFileNotSupport = true }"
      @upload-images="onUploadImage"
    />
    <ProcessList
      v-if="state.hideAppPhoto"
      :process-list="state.processList"
      @back="onBackToAddPhoto"
      @download-item="downloadImage"
      @download-all="downloadAll"
    />
  </div>
  <FooterInformation />
  <div id="hidden" />
</template>

<style scoped>
.main {
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.alert {
  position: fixed;
  top: 16px;
  right: 16px;
}

.alert {
  min-width: 300px;
}

#hidden {
  position: fixed;
  left: 200vw;
  top: 0;
}
</style>
