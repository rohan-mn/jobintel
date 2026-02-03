# jobintel

Real-Time Job Market Intelligence Platform.

## Structure
- apps/web: Next.js dashboard
- apps/api: NestJS API
- services/scraper: Scraper service
- infra: docker-compose, local infrastructure

### Commands to run

1) docker run 

2) Backend  
    (a) (Nest JS)
      -> npm run start  

    (b) (Scrapper)
      -> npm run dev

    (c) (Worker)
      -> npm run dev


3) Frontend
    -> npm run dev

## Note 
Check if ports 5432 AND 6379 are occupied, using cmd
```
C:\Windows\System32>netstat -ano | findstr :5432
  TCP    0.0.0.0:5432           0.0.0.0:0              LISTENING       7528
  TCP    0.0.0.0:5432           0.0.0.0:0              LISTENING       21472
  TCP    [::]:5432              [::]:0                 LISTENING       7528
  TCP    [::]:5432              [::]:0                 LISTENING       21472

C:\Windows\System32>
C:\Windows\System32>taskkill /PID 7528 /F
SUCCESS: The process with PID 7528 has been terminated.

C:\Windows\System32>netstat -ano | findstr :5432
  TCP    0.0.0.0:5432           0.0.0.0:0              LISTENING       21472
  TCP    [::]:5432              [::]:0                 LISTENING       21472

C:\Windows\System32>
```