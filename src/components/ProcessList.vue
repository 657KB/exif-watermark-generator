<script setup lang="ts">
import { ArrowBackOutlined, DownloadOutlined, ImageOutlined } from '@vicons/material'
import { Icon } from '@vicons/utils'
import { NButton, NProgress, NSpin } from 'naive-ui'
import { reactive, watch } from 'vue'
import { useThemeVars } from 'naive-ui'
import type { ProcessItem } from '../App.vue'

const themeVars = useThemeVars()
const props = defineProps<{ processList: ProcessItem[] }>()
const emits = defineEmits<{
  (event: 'back'): void
  (event: 'preview-item', item: ProcessItem): void
  (event: 'download-item', item: ProcessItem): void
  (event: 'download-all'): void
}>()
const progress = reactive({ value: 0 })
watch(props.processList, () => {
  const finished = props.processList.filter(item => item.status === 'done' || item.status === 'failed').length
  progress.value = finished / props.processList.length
})
</script>

<template>
  <div>
    <div class="process-list">
      <div class="process-item" v-for="item in props.processList">
        <div class="process-item-name">
          <span>{{ item.image.name }}</span>
        </div>
        <div v-if="item.status !== 'done'" class="process-item-status" :data-status="item.status">
          <NSpin v-if="item.status === 'processing'" :size="16" />
          <span v-else-if="item.status === 'waiting'">准备中...</span>
          <span v-else-if="item.status === 'failed'">失败</span>
        </div>
        <div v-else>
          <NButton round quaternary type="info" size="small" @click="() => emits('preview-item', item)">
            <template #icon>
              <Icon>
                <ImageOutlined />
              </Icon>
            </template>
            查看
          </NButton>
          <NButton round quaternary type="success" size="small" @click="() => emits('download-item', item)">
            <template #icon>
              <Icon>
                <DownloadOutlined />
              </Icon>
            </template>
            下载
          </NButton>
        </div>
      </div>
    </div>
    <div class="gap-v" />
    <div class="button-group">
      <NButton round @click="() => emits('back')">
        <template #icon>
          <Icon>
            <ArrowBackOutlined />
          </Icon>
        </template>
        选择其他图片
      </NButton>
      <div class="gap-h" />
      <NButton round secondary type="success" :disabled="processList.some(item => item.status !== 'done' && item.status !== 'failed')"
        @click="() => emits('download-all')">
        <template #icon>
          <Icon>
            <DownloadOutlined />
          </Icon>
        </template>
        打包下载
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.process-list {
  box-sizing: border-box;
  width: min(90vw, 640px);
  max-height: 80vh;

  border-radius: 8px;
  border: 1px solid #ccc;

  overflow: auto;
}

.process-list::-webkit-scrollbar {
  width: 0;

  background-color: transparent;
}

.process-list::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: #aaa;
}

.process-item {
  display: flex;
  flex-direction: row;
  align-items: center;

  padding: 16px;
}

.process-item-name {
  flex: 1;

  width: 0;
  min-height: 28px;
  padding-right: 1em;

  display: flex;
  align-items: center;

  &>span {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.process-item-status {
  display: flex;
  align-items: center;
}

.process-item-status[data-status=waiting] {
  color: #ccc;
}

.process-item-status[data-status=processing] {
  color: #2080f0;
}

.process-item-status[data-status=done] {
  color: #30aa6a;
}

.process-item-status[data-status=failed] {
  color: #de3f5c;
}

.gap-v {
  min-height: 2em;
}

.gap-h {
  min-width: 1em;
}

.download-button {
  visibility: hidden;
  pointer-events: none;
}

.download-button[data-visible=true] {
  visibility: visible;
  pointer-events: all;
}

.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;
}
</style>