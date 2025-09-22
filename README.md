# GOFish Sustainably - source code Repository

## Overview
This repository contains the **full source code** of the **GOFish Sustainably Dashboard** (FIT5120 T13 project).  
It is intended for **active development**, iteration builds, and collaboration across frontend, backend, and database layers.  

The deployed and production-ready version is hosted separately in the https://github.com/jguo1124/FIT5120_T13_FISHINGMAN.git


## Features
- **Dashboard**  
  Regulations by zone with legal size, season, and quota limits.
- **Endangered Species**  
  Table and gallery of protected species with compliance details.
- **Weather (Popup Tool)**  
  Weather updates available via popup (manual refresh).
- **About**  
  Project background and sustainability goals.

## Setup
1. Clone the repo:
git clone https://github.com/jguo1124/FIT5120_T13_FISHINGMAN.git

2. Frontend:
cd frontend
npm install
npm run dev
Runs at http://localhost:5173

3. Backend:
cd backend
npm install
npm run start
Runs at http://localhost:8080

## Database

The project uses **MySQL** to store fishing regulations, species information, and zone-specific rules.  
You will need to create a `.env` file in the backend directory with the following variables:

Server
PORT=8080

Database
DB_MODE=db
DATABASE_URL="mysql://<USERNAME>:<PASSWORD>@<HOST>:3306/FishingData"
DATABASE_URL_MOCK="mysql://<USERNAME>:<PASSWORD>@<HOST>:3306/fishingman_db"

Weather API
OPENWEATHER_API_KEY="<openweather_api_key>"



### Notes
- Replace `<USERNAME>`, `<PASSWORD>`, `<HOST>` and `<openweather_api_key>` with real values.    
- Use `DATABASE_URL_MOCK` when working with mock/test data, and `DATABASE_URL` for the production sch

## Iteration Deliverables
- **Iteration 1**: Core dashboard MVP.  
- **Iteration 2**: Endangered species gallery & compliance features， Weather popup + UI refinements.  

## Tech Stack
- **Frontend:** Vue 3 + Bootstrap 5  
- **Backend:** Node.js (Express) + MySQL  
- **Database:** MySQL (with seed data)  

## Contribution
- Branch workflow:
git checkout -b feature/my-feature
git commit -m "Add endangered species table component"
git push origin feature/my-feature
- Open a PR → Review → Merge.  
- Code reviews are required for all merges.  

## Links
- **Deployed Site:** https://9d5e739b.fishing-man.pages.dev/  
- **Backend:** https://fishing-man.onrender.com  
- **LeanKit Board:** https://monashie.leankit.com/board/2334429603 
- **Project Governance Portfolio:** https://drive.google.com/drive/folders/1qGDRtSjdG9p6qzR-KS_so0xptK2YUcGq?usp=drive_link

## Notes
This repository is **for development only**.  
For the stable production-ready build, visit the https://github.com/jguo1124/fishing-man.git
