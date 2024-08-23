<template>
    <div>
        test
    </div>
</template>

<script>
import axios from 'axios';

    export default {
        async mounted() {
            const response = await axios.get('/api/users')
            console.log(response);
            
        }
    }
</script>

<style lang="scss" scoped>

</style>