<script setup lang="ts">
import { NAlert } from 'naive-ui'
import { reactive } from 'vue'
import { Tags } from 'exifreader'
import asyncPool from 'tiny-async-pool'
import AddPhoto from './components/AddPhoto.vue'
import FooterInformation from './components/FooterInformation.vue'
import ProcessList from './components/ProcessList.vue'
import getEXIF from './util/exif'

type StateType = {
  errorFileNotSupport: boolean
  hideAppPhoto: boolean
  processList: ProcessItem[]
}

export type ProcessItem = {
  image: File
  status: 'waiting' | 'processing' | 'done' | 'failed'
  exif: Tags | null
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
  // const withIndexList = list.map((item, index) => ({ item, index }))
  // const iteratorFn = async ({ item, index } : { item: ProcessItem, index: number }) => {
  //   return { index }
  // }
  // for await (const { index } of asyncPool(3, withIndexList, iteratorFn)) {
  //   console.log(index)
  // }
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
      list.push({ image: file, status: 'waiting', exif: null })
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
const downloadImage = () => {
  //
}
const downloadAll = () => {
  //
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
</style>
