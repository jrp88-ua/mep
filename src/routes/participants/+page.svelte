<script lang="ts">
    import { invoke } from "@tauri-apps/api";

    let p = invoke("open_db_file_with_password", {
        password: "juan"
    });
</script>

{#await p}
    Loading...
{:then v} 
    {@html v}
{:catch e}
    {@html e}
{/await}