<template>
  <div class="empty">
    <!-- Emoji displayed when there are no results -->
    <div class="emoji">🪼</div>

    <!-- Main title for the empty state -->
    <div class="title">No species on this page</div>

    <!-- Subtitle suggesting the user to try again -->
    <div class="sub">Try another keyword or change filters.</div>
  </div>
</template>

<style scoped>
/* Container for empty state */
.empty {
  grid-column: 1 / -1;   
  text-align: center;    
  padding: 24px;         
  background: #fff;      
  border: 1px solid #e2e8f0; 
  border-radius: 16px;   
}

/* Emoji style */
.emoji {
  font-size: 36px; 
}

/* Title text */
.title {
  font-weight: 700;   
  margin-top: 6px;    
}

/* Subtitle text */
.sub {
  color: #64748b;     
  margin-top: 2px;   
}
</style>
