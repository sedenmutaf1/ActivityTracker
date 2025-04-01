from fastapi import FastAPI
from contextlib import asynccontextmanager
import redis
import uvicorn
from backend.app.api import session, tracking, user
from fastapi.middleware.cors import CORSMiddleware

# Define a lifespan context for FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.Redis(host='localhost', port=6379, db=0)
    yield
    app.state.redis.close()  # Close connection on shutdown

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include your routers
app.include_router(session.router)
app.include_router(tracking.router)
app.include_router(user.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
