<script setup lang="ts">
import { watch } from 'vue';
import type {
  ApiKeyAuthConfig,
  ApiKeyPlacement,
  AuthType,
  BasicAuthConfig,
  BearerAuthConfig,
  OAuth2Config,
  OAuth2GrantType,
} from '../../../core/security/interfaces';
import type { AuthEditorEmits, AuthEditorProps } from './interfaces';
import { useAuthEditor } from './use-auth-editor';

const props = defineProps<AuthEditorProps>();
const emit = defineEmits<AuthEditorEmits>();

const {
  authTypeOptions,
  currentAuth,
  authType,
  isSecretVisible,
  toggleSecretVisibility,
  setAuthType,
  updateBearerToken,
  updateBasicAuth,
  updateApiKeyAuth,
  updateOAuth2,
} = useAuthEditor(props.modelValue, props.inheritedAuth, emit);

watch(
  () => props.modelValue,
  (newVal) => {
    currentAuth.value = newVal ? { ...newVal } : { type: 'none' };
  },
  { deep: true },
);
</script>

<template>
  <div class="p-4 flex flex-col gap-5 text-bone-100 text-xs">
    <div class="flex items-center gap-3">
      <label class="font-bold text-fossil-300 w-28">Tipo de Auth:</label>
      <select
        :value="authType"
        class="bg-surface-ground border border-surface-border text-xs rounded-lg px-3 py-2 text-bone-200 focus:outline-none focus:border-dino-400 cursor-pointer"
        @change="setAuthType(($event.target as HTMLSelectElement).value as AuthType)"
      >
        <option
          v-for="opt in authTypeOptions"
          :key="opt.type"
          :value="opt.type"
          class="bg-surface-panel"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div v-if="authType === 'none'" class="p-4 rounded-lg bg-surface-ground/40 border border-surface-border text-fossil-400">
      Nenhum cabeçalho ou parâmetro de autenticação será anexado a esta requisição.
    </div>

    <div v-else-if="authType === 'inherit'" class="p-4 rounded-lg bg-surface-ground/40 border border-surface-border text-amber-300">
      Herdando configurações de autenticação da coleção ou pasta superior.
    </div>

    <div v-else-if="authType === 'bearer'" class="flex flex-col gap-4 p-4 rounded-lg bg-surface-ground/40 border border-surface-border">
      <div class="flex flex-col gap-1.5">
        <label class="text-fossil-300 font-semibold">Prefixo:</label>
        <input
          :value="(currentAuth as BearerAuthConfig).prefix ?? 'Bearer'"
          type="text"
          placeholder="Bearer"
          class="w-48 bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
          @input="updateBearerToken((currentAuth as BearerAuthConfig).token, ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-fossil-300 font-semibold">Token (suporta &#123;&#123;variavel&#125;&#125;):</label>
          <button
            type="button"
            class="text-xs text-dino-400 hover:underline cursor-pointer"
            @click="toggleSecretVisibility()"
          >
            {{ isSecretVisible ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <input
          :value="(currentAuth as BearerAuthConfig).token"
          :type="isSecretVisible ? 'text' : 'password'"
          placeholder="&#123;&#123;access_token&#125;&#125; ou token fixo"
          class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
          @input="updateBearerToken(($event.target as HTMLInputElement).value, (currentAuth as BearerAuthConfig).prefix)"
        />
      </div>
    </div>

    <div v-else-if="authType === 'basic'" class="flex flex-col gap-4 p-4 rounded-lg bg-surface-ground/40 border border-surface-border">
      <div class="flex flex-col gap-1.5">
        <label class="text-fossil-300 font-semibold">Usuário:</label>
        <input
          :value="(currentAuth as BasicAuthConfig).username"
          type="text"
          placeholder="admin ou &#123;&#123;username&#125;&#125;"
          class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
          @input="updateBasicAuth(($event.target as HTMLInputElement).value, (currentAuth as BasicAuthConfig).password)"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-fossil-300 font-semibold">Senha:</label>
          <button
            type="button"
            class="text-xs text-dino-400 hover:underline cursor-pointer"
            @click="toggleSecretVisibility()"
          >
            {{ isSecretVisible ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <input
          :value="(currentAuth as BasicAuthConfig).password"
          :type="isSecretVisible ? 'text' : 'password'"
          placeholder="senha ou &#123;&#123;password&#125;&#125;"
          class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
          @input="updateBasicAuth((currentAuth as BasicAuthConfig).username, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div v-else-if="authType === 'apiKey'" class="flex flex-col gap-4 p-4 rounded-lg bg-surface-ground/40 border border-surface-border">
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-fossil-300 font-semibold">Nome da Chave:</label>
          <input
            :value="(currentAuth as ApiKeyAuthConfig).key"
            type="text"
            placeholder="X-API-Key ou apikey"
            class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
            @input="updateApiKeyAuth(($event.target as HTMLInputElement).value, (currentAuth as ApiKeyAuthConfig).value, (currentAuth as ApiKeyAuthConfig).addTo)"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-fossil-300 font-semibold">Adicionar em:</label>
          <select
            :value="(currentAuth as ApiKeyAuthConfig).addTo"
            class="bg-surface-ground border border-surface-border text-xs rounded-lg px-3 py-2 text-bone-200 focus:outline-none focus:border-dino-400 cursor-pointer"
            @change="updateApiKeyAuth((currentAuth as ApiKeyAuthConfig).key, (currentAuth as ApiKeyAuthConfig).value, ($event.target as HTMLSelectElement).value as ApiKeyPlacement)"
          >
            <option value="header" class="bg-surface-panel">Header</option>
            <option value="query" class="bg-surface-panel">Query Params</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-fossil-300 font-semibold">Valor da Chave:</label>
          <button
            type="button"
            class="text-xs text-dino-400 hover:underline cursor-pointer"
            @click="toggleSecretVisibility()"
          >
            {{ isSecretVisible ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <input
          :value="(currentAuth as ApiKeyAuthConfig).value"
          :type="isSecretVisible ? 'text' : 'password'"
          placeholder="&#123;&#123;api_key&#125;&#125; ou valor fixo"
          class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
          @input="updateApiKeyAuth((currentAuth as ApiKeyAuthConfig).key, ($event.target as HTMLInputElement).value, (currentAuth as ApiKeyAuthConfig).addTo)"
        />
      </div>
    </div>

    <div v-else-if="authType === 'oauth2'" class="flex flex-col gap-4 p-4 rounded-lg bg-surface-ground/40 border border-surface-border">
      <div class="flex flex-col gap-1.5">
        <label class="text-fossil-300 font-semibold">Grant Type:</label>
        <select
          :value="(currentAuth as OAuth2Config).grantType"
          class="bg-surface-ground border border-surface-border text-xs rounded-lg px-3 py-2 text-bone-200 focus:outline-none focus:border-dino-400 cursor-pointer"
          @change="updateOAuth2({ grantType: ($event.target as HTMLSelectElement).value as OAuth2GrantType })"
        >
          <option value="client_credentials" class="bg-surface-panel">Client Credentials</option>
          <option value="authorization_code" class="bg-surface-panel">Authorization Code com PKCE</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-fossil-300 font-semibold">Token URL:</label>
          <input
            :value="(currentAuth as OAuth2Config).tokenUrl"
            type="text"
            placeholder="https://auth.example.com/oauth/token"
            class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
            @input="updateOAuth2({ tokenUrl: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-fossil-300 font-semibold">Client ID:</label>
          <input
            :value="(currentAuth as OAuth2Config).clientId"
            type="text"
            placeholder="client-id"
            class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
            @input="updateOAuth2({ clientId: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-fossil-300 font-semibold">Access Token:</label>
        <input
          :value="(currentAuth as OAuth2Config).accessToken ?? ''"
          type="text"
          placeholder="&#123;&#123;access_token&#125;&#125; ou gerado automaticamente"
          class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-dino-400"
          @input="updateOAuth2({ accessToken: ($event.target as HTMLInputElement).value })"
        />
      </div>
    </div>
  </div>
</template>
