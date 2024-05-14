<script setup lang="ts">
import { ArrowBackOutlined, DownloadOutlined } from '@vicons/material'
import { Icon } from '@vicons/utils'
import { NButton, NSpin } from 'naive-ui'
import type { ProcessItem } from '../App.vue'

const props = defineProps<{ processList: ProcessItem[] }>()
const emits = defineEmits<{
  (event: 'back'): void
  (event: 'download-item', index: number): void
  (event: 'download-all'): void
}>()
</script>

<template>
  <div class="process-list">
    <div class="process-item" v-for="(item, itemIndex) in props.processList">
      <div class="process-item-name">
        <span>{{ item.image.name }}</span>
      </div>
      <div
        v-if="item.status !== 'done'"
        class="process-item-status"
        :data-status="item.status"
      >
        <NSpin v-if="item.status === 'processing'" :size="16" />
        <span v-else-if="item.status === 'waiting'">准备中...</span>
        <span v-else-if="item.status === 'failed'">失败</span>
      </div>
      <NButton
        v-else
        round
        quaternary
        type="success"
        size="small"
        @click="() => emits('download-item', itemIndex)"
      >
        <template #icon>
          <Icon>
            <DownloadOutlined />
          </Icon>
        </template>
        下载
      </NButton>
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
      返回选择其他图片
    </NButton>
    <div class="gap-h" />
    <NButton
      round
      secondary
      type="success"
      :disabled="processList.some(item => item.status !== 'done')"
      @click="() => emits('download-all')"
    >
      <template #icon>
        <Icon>
          <DownloadOutlined />
        </Icon>
      </template>
      打包下载
    </NButton>
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
  padding-right: 1em;

  display: flex;
  align-items: center;

  & > span {
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