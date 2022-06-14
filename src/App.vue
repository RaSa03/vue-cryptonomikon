<template>
  <html>
    <head> </head>
    <body>
      <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
        <div
          v-if="circle"
          class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <div class="container">
          <!-- =============================================================== -->
          <add-ticker
            @add-ticker="addTicker"
            :allCoins="coins"
            :allTickers="tickers"
          />
          <!-- =============================================================== -->

          <template v-if="tickers.length">
            <hr class="w-full border-t border-gray-600 my-4" />
            Фильтр:
            <div class="flex items-center">
              <input
                v-model="filter"
                @input="page = 1"
                type="text"
                name="wallet"
                id="wallet"
                class="pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              />
              <div>
                <!-- =============================================================== -->
                <my-button v-if="page > 1" @click="page--" class="ml-4">
                  Назад
                </my-button>
                <my-button v-if="hasNextPage" @click="page++" class="ml-4">
                  Вперёд
                </my-button>
                <!-- =============================================================== -->
              </div>
            </div>

            <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div
                v-for="(t, idx) in paginatedTickers"
                :key="t.name"
                @click="select(t)"
                class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solidcursor-pointer"
                :class="{
                  'border-4': selected == t,
                  'bg-red-100': t.price == '-',
                }"
              >
                <div class="px-4 py-5 sm:p-6 text-center">
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ t.name }} - USD
                  </dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">
                    {{ formatPrice(t.price) }}
                  </dd>
                </div>
                <div class="w-full border-t border-gray-200"></div>
                <button
                  @click.stop="deleteTicker(t)"
                  class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
                >
                  <svg
                    class="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="#718096"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path></svg
                  >Удалить
                </button>
              </div>
            </dl>
            <hr class="w-full border-t border-gray-600 my-4" />
          </template>

          <section v-if="selected" class="relative">
            <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
              {{ selected.name }} - USD
            </h3>

            <!-- ======================================================= -->
            <my-button
              @click="selected = null"
              class="absolute top-0 right-0 rounded-full px-4 py-3"
            >
              X
            </my-button>
            <div
              class="flex items-end border-gray-600 border-b border-l h-64"
              ref="graph"
            >
              <coin-price-graph :coinGraph="normalizedGraph" />
              <!-- <div
                v-for="(bar, index) in normalizedGraph"
                :key="index"
                :style="{ height: `${bar}%` }"
                class="bg-purple-800 border w-5"
              ></div> -->
            </div>
          </section>
        </div>
      </div>
    </body>
  </html>
</template>

<script>
import { subscribeToTiker, unsubscribeFromTicker } from '@/api';
import AddTicker from '@/components/AddTicker.vue';
import MyButton from '@/components/UI/MyButton.vue';
import CoinPriceGraph from './components/CoinPriceGraph.vue';
export default {
  components: { AddTicker, MyButton, CoinPriceGraph },
  data() {
    return {
      circle: true,
      coins: [],
      tickers: [],
      selected: null,
      graph: [],
      filter: '',
      page: 1,
      maxGraphElements: 1,
    };
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = windowData.page;
    }

    const localTickers = localStorage.getItem('cryptonomikon-list');

    if (localTickers) {
      this.tickers = JSON.parse(localTickers);
      this.tickers.forEach((ticker) => {
        subscribeToTiker(ticker.name, (newPrice) =>
          this.updateTickers(ticker.name, newPrice)
        );
      });
    }
  },
  mounted() {
    this.getAllCoins();
    window.addEventListener('resize', this.calculateMaxGraphElements);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateMaxGraphElements);
  },
  methods: {
    getAllCoins() {
      if (!localStorage.getItem('allCoins')) {
        async function getCoins() {
          const f = await fetch(
            'https://min-api.cryptocompare.com/data/all/coinlist'
          );
          const dt = await f.json();
          const cns = Object.getOwnPropertyNames(dt.Data);
          return cns;
        }
        getCoins().then((coins) => {
          this.coins = coins;
          this.coins.sort();
          this.circle = false;
          localStorage.setItem('allCoins', JSON.stringify(this.coins));
        });
      } else {
        this.coins = JSON.parse(localStorage.getItem('allCoins'));
        this.circle = false;
      }
    },
    select(tckr) {
      this.selected = tckr;
    },
    addTicker(ticker) {
      const currentTicker = { name: ticker.toUpperCase(), price: '-' };
      this.tickers = [...this.tickers, currentTicker];

      this.filter = '';
      subscribeToTiker(currentTicker.name, (newPrice) =>
        this.updateTickers(currentTicker.name, newPrice)
      );
    },
    calculateMaxGraphElements() {
      if (!this.$refs.graph) {
        return;
      }
      this.maxGraphElements = this.$refs.graph.clientWidth / 20;
      if (this.graph.length > this.maxGraphElements) {
        this.graph = this.graph.slice(
          this.graph.length - this.maxGraphElements
        );
      }
    },
    updateTickers(tickerName, price) {
      this.tickers
        .filter((t) => t.name == tickerName)
        .forEach((t) => {
          if (t === this.selected) {
            this.graph.push(t.price);
            if (this.graph.length > this.maxGraphElements) {
              this.graph = this.graph.slice(
                this.graph.length - this.maxGraphElements
              );
            }
          }
          t.price = price;
        });
    },
    formatPrice(price) {
      if (price === '-') {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    deleteTicker(TickerToRemove) {
      this.tickers = this.tickers.filter((t) => t != TickerToRemove);
      if (TickerToRemove == this.selected) {
        this.selected = null;
      }
      unsubscribeFromTicker(TickerToRemove.name);
    },
  },
  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    filteredTickers() {
      return this.tickers.filter((coin) =>
        coin.name.includes(this.filter.toUpperCase())
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    normalizedGraph() {
      const minValue = Math.min(...this.graph);
      const maxValue = Math.max(...this.graph);
      if (maxValue == minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minValue) / (maxValue - minValue)) * 95
      );
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },
  watch: {
    selected() {
      this.graph = [];
      // setTimeout(() => {  //ждем отображения DOM
      //   this.calculateMaxGraphElements();
      // });
      this.$nextTick().then(() => this.calculateMaxGraphElements()); //тоже самое
    },
    paginatedTickers() {
      if (this.paginatedTickers.length == 0 && this.page > 1) {
        this.page--;
      }
    },
    tickers() {
      localStorage.setItem('cryptonomikon-list', JSON.stringify(this.tickers));
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>

<style src="./app.css"></style>
