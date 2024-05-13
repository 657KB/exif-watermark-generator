<script setup lang="ts">
import { NAlert } from 'naive-ui'
import { reactive } from 'vue'
import AddPhoto from './components/AddPhoto.vue'
import FooterInformation from './components/FooterInformation.vue'
import ProcessList from './components/ProcessList.vue'

type StateType = {
  errorIsNotImage: boolean
  hideAppPhoto: boolean
  processList: ProcessItem[]
}

export type ProcessItem = {
  image: File
  status: 'waiting' | 'processing' | 'done'
}

const state = reactive<StateType>({
  errorIsNotImage: false,
  hideAppPhoto: false,
  processList: [],
})

const onErrorIsNotImageAlertLeave = () => {
  state.errorIsNotImage = false
}

const onUploadImage = (files: FileList) => {
  const list: ProcessItem[] = []
  const len = files.length
  for (let i = 0; i < len; i += 1) {
    const file = files.item(i)
    if (file !== null) {
      list.push({ image: file, status: 'waiting' })
    }
  }
  state.processList = list
  state.hideAppPhoto = true
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
      v-if="state.errorIsNotImage"
      class="alert"
      title="Error"
      type="error"
      closable
      :bordered="false"
      @after-leave="onErrorIsNotImageAlertLeave"
    >
      上传的文件中包含非图片文件
    </NAlert>
  </div>
  <div class="main">
    <AddPhoto
      v-if="!state.hideAppPhoto"
      @error-is-not-image="() => { state.errorIsNotImage = true }"
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
