<script lang="ts">
  import '@caderno-ui/elements/icon'
  import type { NotebookDoodleName } from '@/lib/notebook-doodles'

  type Props = {
    className?: string
    label?: string
    name: NotebookDoodleName
    size?: number | string
  }

  let {
    className = '',
    label,
    name,
    size = 24,
  }: Props = $props()
</script>

<cad-icon class={className} label={label} name={name} size={String(size)}></cad-icon>
