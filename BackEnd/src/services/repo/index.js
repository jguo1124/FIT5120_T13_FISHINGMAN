import dotenv from "dotenv";
dotenv.config();

const mode = (process.env.DB_MODE || "mock").toLowerCase();

let repo;
if (mode === "db") {
  
  repo = await import("./prismaRepo.js");
} else {
  repo = await import("./mockRepo.js");
}
export default repo;
