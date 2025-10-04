<template>
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <!-- Grid Pattern -->
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#CCCCCC" stroke-width="0.5"/>
      </pattern>
      
      <!-- Dots Pattern -->
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1.5" fill="#CCCCCC" />
      </pattern>
      
      <!-- Lines Pattern -->
      <pattern id="lines" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="20" stroke="#CCCCCC" stroke-width="1" />
      </pattern>
      
      <!-- Checks Pattern -->
      <pattern id="checks" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="10" height="10" fill="#F5F5F5"/>
        <rect x="10" y="10" width="10" height="10" fill="#F5F5F5"/>
      </pattern>
    </defs>
  </svg>
</template>

<script>
export default {
  name: 'EditorBackgroundPatterns'
}
</script>