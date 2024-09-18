<script setup lang="ts">
import { saveAs } from 'file-saver'
import { NAlert } from 'naive-ui'
import { reactive } from 'vue'
import { Tags } from 'exifreader'
import asyncPool from 'tiny-async-pool'
import AddPhoto from './components/AddPhoto.vue'
import FooterInformation from './components/FooterInformation.vue'
import ProcessList from './components/ProcessList.vue'
import getEXIF from './util/exif'
import { generateImageWithExifPhotoFrame } from './util/generator'
import JSZip from 'jszip'

type StateType = {
  errorFileNotSupport: boolean
  hideAppPhoto: boolean
  processList: ProcessItem[]
  previewImageBlobUrl: string | null
}

export type ProcessItem = {
  image: File
  status: 'waiting' | 'processing' | 'done' | 'failed'
  exif: Tags | null
  blob: Blob | null
}

const state = reactive<StateType>({
  errorFileNotSupport: false,
  hideAppPhoto: false,
  processList: [],
  previewImageBlobUrl: null,
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
  const iteratorFn = async ({ item, index }: { item: ProcessItem, index: number }) => {
    if (item.status !== 'failed') {
      state.processList[index].status = 'processing'
      try {
        const blob = await generateImageWithExifPhotoFrame(item.image, item.exif!)
        return { index, blob }
      } catch (expection) {
        console.error(expection)
      }
    }
    return { index, blob: null }
  }
  for await (const { index, blob } of asyncPool(3, withIndexList, iteratorFn)) {
    if (blob !== null) {
      state.processList[index].status = 'done'
      state.processList[index].blob = blob
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
      list.push({ image: file, status: 'waiting', exif: null, blob: null })
    }
  }

  state.processList = list
  state.hideAppPhoto = true

  setTimeout(() => start(list), 300)
}

const onBackToAddPhoto = () => {
  state.hideAppPhoto = false
  state.processList = []
}

const onPreviewItem = (item: ProcessItem) => {
  try {
    const tempUrl = (window.URL || window.webkitURL).createObjectURL(item.blob!)
    open(tempUrl)
  } catch (err) {
    console.error(err)
  }
}

const downloadImage = (item: ProcessItem) => {
  saveAs(item.blob!, item.image.name)
}

const downloadAll = () => {
  const zip = new JSZip()
  state.processList.forEach(({ image, status, blob }) => {
    if (status === 'done') {
      zip.file(image.name, blob!)
    }
  })
  zip.generateAsync({ type: 'blob' }).then(function (content) {
    saveAs(content, `photos_${Date.now()}.zip`)
  })
}
</script>

<template>
  <div class="alert-list">
    <NAlert v-if="state.errorFileNotSupport" class="alert" title="Error" type="error" closable :bordered="false"
      @after-leave="onErrorIsNotSupportFileAlertLeave">
      选择的图片中包含不支持的文件（不是图片 or 不是 jpg 格式的图片）
    </NAlert>
  </div>
  <div class="main">
    <Transition name="main" mode="out-in">
      <AddPhoto v-if="!state.hideAppPhoto" @error-file-not-support="() => { state.errorFileNotSupport = true }"
        @upload-images="onUploadImage" />
      <ProcessList v-else :process-list="state.processList" @back="onBackToAddPhoto" @download-item="downloadImage"
        @download-all="downloadAll" @preview-item="onPreviewItem" />
    </Transition>
  </div>
  <FooterInformation />
  <!-- <Transition name="preview">
    <div class="preview-modal">
      <img :src="state.previewImageBlobUrl" alt="">
    </div>
  </Transition> -->
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

.main-move,
.main-enter-active,
.main-leave-active {
  transition: all 0.15s ease;
}

.main-enter-from,
.main-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.main-leave-active {
  position: absolute;
}
</style>
