<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            @input="findEqual"
            v-model="ticker"
            @keydown.enter="addTicker"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="findCoin.length > 0 && ticker"
          class="flex bg-white p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-for="(item, idx) in findCoin"
            :key="idx"
            @click="autoComplit(item)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ item }}
          </span>
        </div>
        <div v-if="chekCoin" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
        <div v-if="coinInBase" class="text-sm text-red-600">
          В базе нет такого тикера
        </div>
      </div>
    </div>
    <my-button @click="addTicker" type="button">
      <svg-plus />
      Добавить
    </my-button>
  </section>
</template>

<script>
import MyButton from '@/components/UI/MyButton.vue';
import SvgPlus from '@/components/UI/SvgPlus.vue';
export default {
  components: { MyButton, SvgPlus },
  data() {
    return {
      ticker: '',
      findCoin: [],
      chekCoin: false,
      coinInBase: false,
    };
  },
  props: {
    allCoins: {
      type: Array,
      required: true,
      default: [],
    },
    allTickers: {
      type: Array,
      required: false,
      default: [],
    },
  },
  emits: {
    'add-ticker': (value) => typeof value === 'string',
  },
  methods: {
    autoComplit(item) {
      this.ticker = item;
      this.chekCoin = false;
    },
    addTicker() {
      if (this.ticker.length === 0) return;
      const tickersName = [];
      let chek = false;
      for (let i = 0; i < this.allTickers.length; i++) {
        const name = this.allTickers[i];
        tickersName.push(name.name);
        if (tickersName.includes(this.ticker.toUpperCase())) {
          this.chekCoin = true;
          break;
        }
      }
      chek = this.allCoins.includes(this.ticker.toUpperCase());

      if (!this.chekCoin && chek) {
        this.$emit('add-ticker', this.ticker);
        this.ticker = '';
      } else if (!chek) {
        this.coinInBase = true;
      }
    },
    findEqual() {
      this.coinInBase = this.chekCoin = false;
      this.findCoin.length = 0;
      for (let i = 0; i < this.allCoins.length; i++) {
        const con = this.allCoins[i];
        if (con.startsWith(this.ticker.toUpperCase())) {
          this.findCoin.push(con);
        }
        if (this.findCoin.length == 4) break;
      }
    },
  },
};
</script>

<style></style>
