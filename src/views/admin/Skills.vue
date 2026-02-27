<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminAPI, type AdminSkill, type AdminCreateSkillPayload } from '@/api/admin'
import IdCell from '@/components/IdCell.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { notifyError } from '@/utils/notify'
import { confirmAction } from '@/utils/confirm'

const { t } = useI18n()
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const skills = ref<AdminSkill[]>([])

const form = reactive<AdminCreateSkillPayload & { id?: number; enabled_tools_text: string }>({
  id: undefined,
  name: '',
  description: '',
  system_prompt: '',
  enabled_tools: [],
  enabled_tools_text: '',
  status: 'active',
})

const fetchSkills = async () => {
  loading.value = true
  try {
    const res = await adminAPI.getSkills()
    skills.value = (res.data.data as AdminSkill[]) || []
  } catch {
    skills.value = []
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  Object.assign(form, {
    id: undefined,
    name: '',
    description: '',
    system_prompt: '',
    enabled_tools: [],
    enabled_tools_text: '',
    status: 'active',
  })
  showModal.value = true
}

const openEditModal = (skill: AdminSkill) => {
  isEditing.value = true
  Object.assign(form, {
    id: skill.id,
    name: skill.name,
    description: skill.description || '',
    system_prompt: skill.system_prompt,
    enabled_tools: skill.enabled_tools || [],
    enabled_tools_text: (skill.enabled_tools || []).join('\n'),
    status: skill.status,
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  const enabled_tools = form.enabled_tools_text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const payload = {
    name: form.name,
    description: form.description || undefined,
    system_prompt: form.system_prompt,
    enabled_tools,
    status: form.status,
  }

  try {
    if (isEditing.value && form.id != null) {
      await adminAPI.updateSkill(form.id, payload)
    } else {
      await adminAPI.createSkill(payload)
    }
    closeModal()
    fetchSkills()
  } catch (err: any) {
    notifyError(t('admin.skills.errors.operationFailed', { message: err?.message || '' }))
  }
}

const handleDelete = async (skill: AdminSkill) => {
  const confirmed = await confirmAction({
    description: t('admin.skills.confirmDelete', { name: skill.name }),
    confirmText: t('admin.common.delete'),
    variant: 'destructive',
  })
  if (!confirmed) return
  try {
    await adminAPI.deleteSkill(skill.id)
    fetchSkills()
  } catch (err: any) {
    notifyError(t('admin.skills.errors.deleteFailed', { message: err?.message || '' }))
  }
}

onMounted(() => {
  fetchSkills()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">{{ t('admin.skills.title') }}</h1>
      <Button @click="openCreateModal">{{ t('admin.skills.create') }}</Button>
    </div>

    <div class="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader class="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
          <TableRow>
            <TableHead class="px-6 py-3">{{ t('admin.skills.table.id') }}</TableHead>
            <TableHead class="px-6 py-3">{{ t('admin.skills.table.name') }}</TableHead>
            <TableHead class="px-6 py-3">{{ t('admin.skills.table.description') }}</TableHead>
            <TableHead class="px-6 py-3">{{ t('admin.skills.table.enabledTools') }}</TableHead>
            <TableHead class="px-6 py-3">{{ t('admin.skills.table.status') }}</TableHead>
            <TableHead class="px-6 py-3 text-right">{{ t('admin.skills.table.action') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-border">
          <TableRow v-if="loading">
            <TableCell colspan="6" class="px-6 py-8 text-center text-muted-foreground">{{ t('admin.common.loading') }}</TableCell>
          </TableRow>
          <TableRow v-else-if="skills.length === 0">
            <TableCell colspan="6" class="px-6 py-8 text-center text-muted-foreground">{{ t('admin.skills.empty') }}</TableCell>
          </TableRow>
          <TableRow v-for="skill in skills" :key="skill.id" class="hover:bg-muted/30">
            <TableCell class="px-6 py-4">
              <IdCell :value="skill.id" />
            </TableCell>
            <TableCell class="px-6 py-4 font-medium text-foreground">{{ skill.name }}</TableCell>
            <TableCell class="px-6 py-4 text-muted-foreground max-w-xs truncate">{{ skill.description }}</TableCell>
            <TableCell class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="tool in (skill.enabled_tools || []).slice(0, 3)"
                  :key="tool"
                  variant="secondary"
                  class="text-xs"
                >{{ tool }}</Badge>
                <Badge
                  v-if="(skill.enabled_tools || []).length > 3"
                  variant="outline"
                  class="text-xs"
                >+{{ (skill.enabled_tools || []).length - 3 }}</Badge>
                <span v-if="!(skill.enabled_tools || []).length" class="text-xs text-muted-foreground">{{ t('admin.skills.allTools') }}</span>
              </div>
            </TableCell>
            <TableCell class="px-6 py-4">
              <Badge :variant="skill.status === 'active' ? 'default' : 'secondary'">
                {{ skill.status === 'active' ? t('admin.common.enabled') : t('admin.common.disabled') }}
              </Badge>
            </TableCell>
            <TableCell class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" @click="openEditModal(skill)">{{ t('admin.skills.actions.edit') }}</Button>
                <Button size="sm" variant="destructive" @click="handleDelete(skill)">{{ t('admin.skills.actions.delete') }}</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="showModal" @update:open="(value) => { if (!value) closeModal() }">
      <DialogScrollContent class="w-full max-w-2xl" @interact-outside="(e) => e.preventDefault()">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? t('admin.skills.modal.editTitle') : t('admin.skills.modal.createTitle') }}</DialogTitle>
        </DialogHeader>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">{{ t('admin.skills.form.name') }}</label>
            <Input v-model="form.name" required :placeholder="t('admin.skills.form.namePlaceholder')" />
          </div>

          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">{{ t('admin.skills.form.description') }}</label>
            <Input v-model="form.description" :placeholder="t('admin.skills.form.descriptionPlaceholder')" />
          </div>

          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">{{ t('admin.skills.form.systemPrompt') }}</label>
            <Textarea
              v-model="form.system_prompt"
              required
              rows="6"
              :placeholder="t('admin.skills.form.systemPromptPlaceholder')"
              class="font-mono text-sm resize-y"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">{{ t('admin.skills.form.enabledTools') }}</label>
            <Textarea
              v-model="form.enabled_tools_text"
              rows="4"
              :placeholder="t('admin.skills.form.enabledToolsPlaceholder')"
              class="font-mono text-sm resize-y"
            />
            <p class="text-xs text-muted-foreground mt-1">{{ t('admin.skills.form.enabledToolsTip') }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-muted-foreground mb-1.5">{{ t('admin.skills.form.status') }}</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.status" name="status" value="active" class="accent-primary" />
                <span class="text-sm">{{ t('admin.common.enabled') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.status" name="status" value="inactive" class="accent-primary" />
                <span class="text-sm">{{ t('admin.common.disabled') }}</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline" @click="closeModal">{{ t('admin.common.cancel') }}</Button>
            <Button type="submit">{{ isEditing ? t('admin.skills.actions.saveChanges') : t('admin.skills.actions.createNow') }}</Button>
          </div>
        </form>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
