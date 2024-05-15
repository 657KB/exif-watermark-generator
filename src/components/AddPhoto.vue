<script setup lang="ts">
import { ImageOutlined } from '@vicons/material'
import { Icon } from '@vicons/utils'
import { onMounted, onUnmounted, ref } from 'vue'
import { NButton } from 'naive-ui'

const emits = defineEmits<{
  (event: 'upload-images', images: FileList): void
  (event: 'error-file-not-support'): void
}>()

const addPhotoArea = ref<HTMLDivElement | null>(null)
const addPhotoTip = ref<HTMLDivElement | null>(null)
const inputFile = ref<HTMLInputElement | null>(null)

const checkIfSomeFileIsNotSupport = (files: FileList) => {
  const len = files.length
  let someFileIsNotSupport = false
  for (let i = 0; i < len; i += 1) {
    const file = files.item(i)
    if (file !== null) {
      const isImage = file.type.startsWith('image')
      const isSupportedFormat = file.type.endsWith('jpeg') || file.type.endsWith('png')
      if (!isImage || !isSupportedFormat) {
        someFileIsNotSupport = true
        i = len
      }
    }
  }
  return someFileIsNotSupport
}

const showCover = (event: DragEvent) => {
  event.preventDefault()
  addPhotoArea.value?.classList.add('dragging')
  addPhotoTip.value?.classList.add('disable-pointer-events')
}

const hideCover = (event: DragEvent) => {
  event.preventDefault()
  addPhotoArea.value?.classList.remove('dragging')
  addPhotoTip.value?.classList.remove('disable-pointer-events')
}

const handleDropFile = (event: DragEvent) => {
  hideCover(event)
  if (event.dataTransfer !== null) {
    const { files } = event.dataTransfer
    if (checkIfSomeFileIsNotSupport(files)) {
      emits('error-file-not-support')
    } else {
      emits('upload-images', files)
    }
  }
}

const handleSelectFile = () => {
  if (inputFile.value !== null && inputFile.value.files !== null) {
    emits('upload-images', inputFile.value.files)
  }
}

const onClickSelectFile = () => {
  inputFile?.value?.click()
}

onMounted(() => {
  addPhotoArea.value?.addEventListener('dragenter', showCover)
  addPhotoArea.value?.addEventListener('dragover', showCover)
  addPhotoArea.value?.addEventListener('dragleave', hideCover)
  addPhotoArea.value?.addEventListener('drop', handleDropFile)
  inputFile.value?.addEventListener('change', handleSelectFile)
})
onUnmounted(() => {
  addPhotoArea.value?.removeEventListener('dragenter', showCover)
  addPhotoArea.value?.removeEventListener('dragover', showCover)
  addPhotoArea.value?.removeEventListener('dragleave', hideCover)
  addPhotoArea.value?.removeEventListener('drop', handleDropFile)
  inputFile.value?.removeEventListener('change', handleSelectFile)
})
</script>

<template>
  <div ref="addPhotoArea" class="add-photo-area">
    <div ref="addPhotoTip" class="tip">
      将图片拖拽至此处
      <p>或者</p>
      <NButton
        ghost
        round
        type="success"
        @click="onClickSelectFile"
      >
        <template #icon>
          <Icon>
            <ImageOutlined />
          </Icon>
        </template>
        选择图片
      </NButton>
      <div class="format-tip">
        <small>支持的格式：*.jpg, *.png</small>
      </div>
    </div>
    <input
      ref="inputFile"
      type="file"
      class="input-file"
      accept="image/jpeg"
      multiple
    />
  </div>
</template>

<style scoped>
.add-photo-area {
  display: flex;
  align-items: center;
  justify-content: center;

  width: min(80vw, 480px);
  height: min(40vh, 320px);
  min-width: 240px;
  min-height: 160px;

  border-radius: 8px;
  border: 4px dashed rgba(0, 0, 0, .24);
;

  text-align: center;
}

.dragging {
  border: 4px dashed rgba(0, 0, 0, .8);
}

.disable-pointer-events {
  pointer-events: none;
}

.input-file {
  display: none;
}

.format-tip {
  margin-top: .5em;
  color: rgba(0, 0, 0, .6);
}
</style>
