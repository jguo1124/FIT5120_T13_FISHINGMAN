<template>
  <section class="hero">
    <div class="content">
      <h1 class="title animate">
        Know the rules<br />
        Fish responsibly<br />
        Conserve nature
      </h1>
      <div class="cta animate delay">
        <RouterLink to="/dashboard" class="btn-text">Click to View Dashboard</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
// purely presentational component
</script>

<style scoped>
.hero {
  background: url('@/assets/hero-bg.jpg') center/cover no-repeat;
  color: white;
  text-align: center;
  padding: 120px 20px;    
  min-height: 55vh;         
  display: flex;
  align-items: center;         
  justify-content: center;
  margin: 0;   
}

.content {
  max-width: 700px;
  margin: 0 auto;
}

.title {
  font-size: 2.5rem;        
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 20px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.7);
}

.cta {
  display: flex;
  justify-content: flex-end; 
}

.btn-text {
  color: #ffffff;
  font-weight: 600;
  text-decoration: underline;
  padding: 6px 0;
  transition: all 0.3s ease;
}
.btn-text:hover {
  text-decoration: underline;
  text-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transform: translateY(-1px);
}

.animate {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1s ease forwards;
}
.animate.delay {
  animation-delay: 0.4s;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
}
@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }
}
</style>