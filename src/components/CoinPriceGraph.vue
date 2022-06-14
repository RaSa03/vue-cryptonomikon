<template>
  <div
    v-for="(bar, index) in coinGraph"
    :key="index"
    :style="{ height: `${bar}%` }"
    class="bg-purple-800 border w-5"
  ></div>
</template>

<script>
export default {
  props: {
    coinGraph: {
      type: Array,
      required: true,
      default: [],
    },
  },
};
</script>

<style lang="scss" scoped></style>
