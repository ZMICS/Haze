from fastapi import FastAPI

app = FastAPI(
      title="HAZE" ,
      description="Transit city hub",
      version="1.0.0"
    )

@app.get("/api/health")
def health_check():
    return {
      "status": "online",
      "project": "HAZE"
    }


