<script setup lang="ts">
import { ImageOutlined } from '@vicons/material'
import { Icon } from '@vicons/utils'
import { onMounted, onUnmounted, ref } from 'vue'
import { NButton } from 'naive-ui'

const emits = defineEmits<{
  (event: 'upload-images', images: FileList): void
  (event: 'error-no-file'): void
  (event: 'error-is-not-image'): void
}>()

const addPhotoArea = ref<HTMLDivElement | null>(null)
const addPhotoTip = ref<HTMLDivElement | null>(null)

const checkIfSomeFileIsNotImage = (files: FileList) => {
  const len = files.length
  let someFileIsNotImage = false
  for (let i = 0; i < len; i += 1) {
    const file = files.item(i)
    if (file !== null && !file.type.startsWith('image')) {
      someFileIsNotImage = true
      i = len
    }
  }
  return someFileIsNotImage
}

const preventDefault = (event: DragEvent) => {
  event.preventDefault()
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
    const files = event.dataTransfer.files
    if (checkIfSomeFileIsNotImage(files)) {
      emits('error-is-not-image')
    } else {
      emits('upload-images', files)
    }
  }
}

onMounted(() => {
  addPhotoArea.value?.addEventListener('dragenter', showCover)
  addPhotoArea.value?.addEventListener('dragover', preventDefault)
  addPhotoArea.value?.addEventListener('dragleave', hideCover)
  addPhotoArea.value?.addEventListener('drop', handleDropFile)
})
onUnmounted(() => {
  addPhotoArea.value?.removeEventListener('dragenter', showCover)
  addPhotoArea.value?.removeEventListener('dragover', preventDefault)
  addPhotoArea.value?.removeEventListener('dragleave', hideCover)
  addPhotoArea.value?.removeEventListener('drop', handleDropFile)
})
</script>

<template>
  <div ref="addPhotoArea" class="add-photo-area">
    <div ref="addPhotoTip" class="tip">
      将图片拖拽至此处
      <p>或者</p>
      <NButton round>
        <template #icon>
          <Icon>
            <ImageOutlined />
          </Icon>
        </template>
        选择图片
      </NButton>
    </div>

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
  border: 4px dashed #ccc;

  text-align: center;
}
.dragging {
  border: 4px dashed #000;
}
.disable-pointer-events {
  pointer-events: none;
}
</style>
