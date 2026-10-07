<script setup lang="ts">
import { ref } from 'vue';
import type { CollectionItem } from '../interfaces';
import type { CollectionTreeProps, CollectionTreeEmits } from './interfaces';
import { useCollectionTree } from './use-collection-tree';

defineProps<CollectionTreeProps>();
const emit = defineEmits<CollectionTreeEmits>();

const handleSelect = (item: CollectionItem): void => {
  emit('selectItem', item);
};

const {
  searchQuery,
  filteredCollections,
  selectedItemId,
  editingItemId,
  editingItemName,
  editingCollectionId,
  editingCollectionName,
  isExpanded,
  toggleExpand,
  addNewRequest,
  addNewCollection,
  deleteCol,
  deleteItm,
  select,
  startRenaming,
  saveRename,
  cancelRename,
  startRenamingCollection,
  saveRenameCollection,
  cancelRenameCollection,
  importPostmanCollection,
} = useCollectionTree(handleSelect);

const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = (): void => {
  fileInputRef.value?.click();
};

const handleFileImport = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === 'string') {
      importPostmanCollection(result);
    }
  };
  reader.readAsText(file);
  
  // Reset input
  target.value = '';
};
</script>

<template>
  <div class="h-full flex flex-col bg-surface-panel select-none">
    <div class="p-3 border-b border-surface-border space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-fossil-300">Coleções</span>
        <div class="flex gap-1.5">
          <button
            type="button"
            class="px-2 py-1 text-xs font-semibold text-dino-300 hover:text-dino-200 bg-dino-500/10 hover:bg-dino-500/20 border border-dino-500/30 rounded flex items-center gap-1 transition-colors"
            @click="triggerFileInput"
          >
            <span>📥</span>
            <span>Importar</span>
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileImport"
          />
          <button
            type="button"
            class="px-2 py-1 text-xs font-semibold text-dino-300 hover:text-dino-200 bg-dino-500/10 hover:bg-dino-500/20 border border-dino-500/30 rounded flex items-center gap-1 transition-colors"
            @click="addNewCollection()"
          >
            <span>+</span>
            <span>Nova</span>
          </button>
        </div>
      </div>

      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filtrar requisições..."
          class="w-full bg-surface-ground border border-surface-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-bone-100 placeholder-fossil-500 focus:outline-none focus:border-dino-400"
        />
        <span class="absolute left-2.5 top-2 text-xs text-fossil-500">🔍</span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <div
        v-for="collection in filteredCollections"
        :key="collection.id"
        class="rounded-lg overflow-hidden border transition-all duration-200 mb-2"
        :class="isExpanded(collection.id) ? 'border-surface-border bg-surface-panel/40 shadow-sm' : 'border-surface-border/50 bg-surface-ground/30 hover:border-surface-border'"
      >
        <div
          class="flex items-center justify-between px-2.5 py-1.5 hover:bg-surface-hover cursor-pointer group transition-colors select-none"
          @click="toggleExpand(collection.id)"
        >
          <div class="flex items-center gap-1.5 truncate flex-1 min-w-0 mr-1">
            <span
              class="w-3.5 h-3.5 flex items-center justify-center text-fossil-400 transition-transform duration-200 shrink-0 group-hover:text-bone-100"
              :class="isExpanded(collection.id) ? 'rotate-90 text-dino-400' : ''"
            >
              <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 16 16">
                <path d="M4.5 2.5L11.5 8L4.5 13.5V2.5Z" />
              </svg>
            </span>
            <span class="text-xs shrink-0 select-none">
              {{ isExpanded(collection.id) ? '📂' : '📁' }}
            </span>
            <input
              v-if="editingCollectionId === collection.id"
              v-model="editingCollectionName"
              type="text"
              autofocus
              class="bg-surface-ground border border-dino-400 rounded px-1.5 py-0.5 text-xs text-bone-100 focus:outline-none w-full font-sans shadow-sm"
              @click.stop
              @dblclick.stop
              @keydown.enter.stop="saveRenameCollection(collection.id)"
              @keydown.esc.stop="cancelRenameCollection"
              @blur="saveRenameCollection(collection.id)"
            />
            <span
              v-else
              class="text-xs font-semibold text-bone-200 truncate select-none group-hover:text-bone-100"
              title="Clique duas vezes para renomear"
              @dblclick.stop="startRenamingCollection(collection)"
            >
              {{ collection.name }}
            </span>
            <span
              v-if="editingCollectionId !== collection.id"
              class="text-[10px] text-fossil-500 shrink-0 px-1 py-0.2 bg-surface-ground/60 rounded border border-surface-border/40 font-mono"
            >
              {{ collection.items.length }}
            </span>
          </div>

          <div
            v-if="editingCollectionId !== collection.id"
            class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop
            @dblclick.stop
          >
            <button
              type="button"
              title="Nova Requisição"
              class="w-5 h-5 flex items-center justify-center text-xs text-dino-400 hover:bg-surface-border rounded"
              @click.stop="addNewRequest(collection.id)"
              @dblclick.stop
            >
              +
            </button>
            <button
              type="button"
              title="Excluir Coleção"
              class="w-5 h-5 flex items-center justify-center text-xs text-fossil-400 hover:text-magma-400 hover:bg-surface-border rounded"
              @click.stop="deleteCol(collection.id)"
              @dblclick.stop
            >
              ✕
            </button>
          </div>
        </div>

        <transition name="trex-collapse-content">
          <div v-if="isExpanded(collection.id)" class="pl-3 pr-1 py-1 space-y-0.5 border-t border-surface-border/30">
          <div
            v-for="item in collection.items"
            :key="item.id"
            class="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer group text-xs transition-colors"
            :class="selectedItemId === item.id ? 'bg-dino-500/20 text-dino-200 border border-dino-500/40' : 'text-fossil-300 hover:bg-surface-hover'"
            @click="select(item)"
          >
            <div class="flex items-center gap-2 truncate flex-1 min-w-0 mr-1">
              <span
                v-if="item.method === 'GET'"
                class="text-[10px] font-black text-dino-400 w-7 tracking-tighter shrink-0"
              >
                GET
              </span>
              <span
                v-else-if="item.method === 'POST'"
                class="text-[10px] font-black text-amber-400 w-7 tracking-tighter shrink-0"
              >
                POST
              </span>
              <span
                v-else-if="item.method === 'PUT'"
                class="text-[10px] font-black text-blue-400 w-7 tracking-tighter shrink-0"
              >
                PUT
              </span>
              <span
                v-else-if="item.method === 'PATCH'"
                class="text-[10px] font-black text-purple-400 w-7 tracking-tighter shrink-0"
              >
                PATCH
              </span>
              <span
                v-else-if="item.method === 'DELETE'"
                class="text-[10px] font-black text-magma-400 w-7 tracking-tighter shrink-0"
              >
                DEL
              </span>
              <span
                v-else
                class="text-[10px] font-black text-fossil-400 w-7 tracking-tighter shrink-0"
              >
                {{ item.method ?? 'REQ' }}
              </span>

              <span
                v-if="item.status"
                class="text-[9px] font-bold px-1 py-0.5 rounded font-mono shrink-0"
                :class="{
                  'text-dino-400 bg-dino-500/10': item.status >= 200 && item.status < 300,
                  'text-amber-400 bg-amber-500/10': item.status >= 300 && item.status < 400,
                  'text-magma-400 bg-magma-500/10': item.status >= 400,
                }"
              >
                {{ item.status }}
              </span>

              <input
                v-if="editingItemId === item.id"
                v-model="editingItemName"
                type="text"
                autofocus
                class="bg-surface-ground border border-dino-400 rounded px-1.5 py-0.5 text-xs text-bone-100 focus:outline-none w-full font-sans shadow-sm"
                @click.stop
                @dblclick.stop
                @keydown.enter.stop="saveRename(collection.id, item.id)"
                @keydown.esc.stop="cancelRename"
                @blur="saveRename(collection.id, item.id)"
              />
              <span
                v-else
                class="truncate text-xs select-none"
                title="Clique duas vezes para renomear"
                @dblclick.stop="startRenaming(item)"
              >
                {{ item.name }}
              </span>
            </div>

            <button
              v-if="editingItemId !== item.id"
              type="button"
              title="Excluir"
              class="w-4 h-4 flex items-center justify-center text-[10px] text-fossil-500 hover:text-magma-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              @click.stop="deleteItm(collection.id, item.id)"
              @dblclick.stop
            >
              ✕
            </button>
          </div>

          <div
            v-if="collection.items.length === 0"
            class="p-2 text-center text-[11px] text-fossil-500"
          >
            Nenhuma requisição criada
          </div>
        </div>
        </transition>
      </div>
    </div>
  </div>
</template>


