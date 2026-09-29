<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { api } from './api'
import type { Todo } from './api'

const todos = ref<Todo[]>([])
const text = ref('')
// 最初の一覧が届くまでは追加させない。後から届いた一覧が、追加した項目を上書きするため。
const busy = ref(true)
const error = ref<string>()

const run = async (action: () => Promise<void>) => {
  error.value = undefined
  try {
    await action()
    return true
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    return false
  }
}

onMounted(async () => {
  await run(async () => {
    todos.value = await api.list()
  })
  busy.value = false
})

// 入力欄は送る前に空ける。待つ間に打った文字を、応答で消さないため。
const add = async () => {
  if (busy.value) return
  const value = text.value
  busy.value = true
  text.value = ''
  const ok = await run(async () => {
    todos.value.push(await api.add(value))
  })
  if (!ok) text.value ||= value
  busy.value = false
}

const remove = (id: number) =>
  run(async () => {
    await api.remove(id)
    todos.value = todos.value.filter((todo) => todo.id !== id)
  })
</script>

<template>
  <main>
    <h1>ToDo</h1>

    <form @submit.prevent="add">
      <label for="todo-text">やること</label>
      <input id="todo-text" v-model="text" maxlength="200" required />
      <button type="submit" :disabled="busy">追加</button>
    </form>

    <p v-if="error" role="alert">{{ error }}</p>

    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <span>{{ todo.text }}</span>
        <button type="button" @click="remove(todo.id)">削除</button>
      </li>
    </ul>
  </main>
</template>
