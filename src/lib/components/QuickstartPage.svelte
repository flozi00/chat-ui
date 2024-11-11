<script lang="ts">
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";

  export let docs: string;
  export let assistants: { name: string; description: string }[];
  export let tools: { displayName: string; description: string }[];

  let quickstartDocs = "";
  let quickstartAssistants = [];
  let quickstartTools = [];

  onMount(() => {
    quickstartDocs = docs || env.QUICKSTART_DOCS || "Welcome to the Quickstart Page!";
    quickstartAssistants = assistants || [];
    quickstartTools = tools || [];
  });

  function closeQuickstart() {
    const event = new CustomEvent("close");
    dispatchEvent(event);
  }
</script>

<style>
  .quickstart-container {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .quickstart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .quickstart-title {
    font-size: 24px;
    font-weight: bold;
  }

  .quickstart-close {
    cursor: pointer;
    font-size: 18px;
  }

  .quickstart-section {
    margin-bottom: 20px;
  }

  .quickstart-section-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .quickstart-item {
    margin-bottom: 10px;
  }

  .quickstart-item-title {
    font-size: 16px;
    font-weight: bold;
  }

  .quickstart-item-description {
    font-size: 14px;
  }
</style>

<div class="quickstart-container">
  <div class="quickstart-header">
    <div class="quickstart-title">Quickstart</div>
    <div class="quickstart-close" on:click={closeQuickstart}>✖</div>
  </div>

  <div class="quickstart-section">
    <div class="quickstart-section-title">Docs</div>
    <div class="quickstart-item">
      <div class="quickstart-item-description">{quickstartDocs}</div>
    </div>
  </div>

  <div class="quickstart-section">
    <div class="quickstart-section-title">Assistants</div>
    {#each quickstartAssistants as assistant}
      <div class="quickstart-item">
        <div class="quickstart-item-title">{assistant.name}</div>
        <div class="quickstart-item-description">{assistant.description}</div>
      </div>
    {/each}
  </div>

  <div class="quickstart-section">
    <div class="quickstart-section-title">Tools</div>
    {#each quickstartTools as tool}
      <div class="quickstart-item">
        <div class="quickstart-item-title">{tool.displayName}</div>
        <div class="quickstart-item-description">{tool.description}</div>
      </div>
    {/each}
  </div>
</div>
