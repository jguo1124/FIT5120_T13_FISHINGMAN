<template>
  <nav class="nav">
    <RouterLink to="/" class="link" active-class="active">Home</RouterLink>
    <RouterLink to="/dashboard" class="link" active-class="active">Dashboard</RouterLink>
    <RouterLink to="/endangered" class="link"active-class="active">Endangered </RouterLink>
    <RouterLink to="/about" class="link" active-class="active">About</RouterLink>
    <RouterLink to="/knowledgeHub" class="link" active-class="active">knowledgehub</RouterLink>
  </nav>
</template>

<script setup lang="ts">

</script>

<style scoped>
.nav {
  display: flex;
  justify-content: center; 
  gap: 30px;            
  align-items: center;
}

.link {
  position: relative;
  text-decoration: none;
  font-weight: 600;
  color: #000000; 
  padding: 6px 0;
  transition: color 0.3s ease, transform 0.3s ease;
}

.link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 2px;
  width: 0;
  background-color: rgba(13,155,181,1); 
  transition: width 0.3s ease;
}

.link:hover {
  color: rgba(13,155,181,1); 
  transform: scale(1.08);    
}

.link:hover::after {
  width: 100%;
}

.active {
  color: rgba(13,155,181,1);  
}
.active::after {
  width: 100%;
}
</style>