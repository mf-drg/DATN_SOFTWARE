<template>
  <div class="flex flex-col justify-center h-screen w-full bg-gray-50">
    <div class="container flex flex-col items-center justify-center px-5 text-gray-700">
      <h1 class="text-8xl md:text-9xl font-dark font-bold">404</h1>
      <p class="text-2xl md:text-3xl font-light leading-normal">Sorry we couldn't find this page.</p>
      <router-link
        class="mt-10 px-4 inline py-2 text-sm font-medium leading-5 shadow text-white transition-colors duration-150 border border-transparent rounded-lg focus:outline-none focus:shadow-outline-blue bg-indigo-600 active:bg-indigo-600 hover:bg-indigo-700"
        to="/">
        Back to homepage</router-link
      >
    </div>
  </div>
</template>