from fastapi import FastAPI

app = FastAPI(title="Aquamate API")

@app.get("/health")
def health_check():
    return {"status": "ok"}
