<script lang="ts">
  import { notebookDoodles, type NotebookDoodleName } from '@/lib/notebook-doodles'

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

  let paths = $derived(notebookDoodles[name])
</script>

<svg
  aria-hidden={label ? undefined : 'true'}
  aria-label={label}
  class="notebook-doodle-icon {className}"
  fill="none"
  height={size}
  role={label ? 'img' : undefined}
  viewBox="0 0 24 24"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <g class="notebook-doodle-icon__echo">
    {#each paths as path}
      <path d={path} />
    {/each}
  </g>
  <g>
    {#each paths as path}
      <path d={path} />
    {/each}
  </g>
</svg>

<style>
  .notebook-doodle-icon {
    display: inline-block;
    flex: 0 0 auto;
    overflow: visible;
    color: inherit;
    vertical-align: -0.18em;
  }

  .notebook-doodle-icon path {
    vector-effect: non-scaling-stroke;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.55;
  }

  .notebook-doodle-icon__echo {
    opacity: 0.22;
    transform: translate(0.36px, -0.22px);
  }
</style>
