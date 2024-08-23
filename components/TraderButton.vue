<template>
    <button
      :style="{
        backgroundImage: `url(${trader.imageLink})`,
        backgroundSize: 'cover',
        color: 'black',
      }"
      @click="filterTasks(trader.id)"
      class="trader-button"
    >
      <h5>{{ trader.name }}</h5>
    </button>
  </template>
  
  <script>
  export default {
    props: {
      trader: {
        type: Object,
        required: true,
      },
    },
    methods: {
      filterTasks(traderId) {
        this.$emit('filter', traderId);
      },
    },
  };
  </script>
  
  <style>
  .trader-button {
    margin-right: 10px;
    margin-bottom: 10px;
    width: 100px;
    height: 100px;
    border: 2px solid green;
    background-color: transparent;
    color: green;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: end;
    align-items: end;
  }
  h5 {
    background: rgb(0, 0, 0, 0.5);
    color: white;
    align-self: end;
  }
  </style>
  